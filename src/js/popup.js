import 'styles/main.scss';

import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';

import chromeMessaging from 'modules/chromeMessaging';
import * as githubScraper from 'modules/githubScraper';
import * as store from 'modules/store';
import { convertPercentageToColor } from 'modules/utils';

const msg = chromeMessaging.init('popup');

/* --------------------------------------
 MAIN UI HANDLING FUNCTIONS
-------------------------------------- */
/* compute CSS styles for progress bar */
const COMPUTE_STYLE = (count, totalCount) => {
  const text = `${count}/${totalCount} commits`;
  const percentage = Math.round((count / totalCount) * 100);
  const width = `${(percentage > 100) ? 100 : percentage}%`;
  const color = convertPercentageToColor(percentage);
  return { color, text, width };
};

const UPDATE_CONTRIBUTIONS = ({ githubId, targetContributionCount }) => {
  githubScraper.getContributionsSummary(githubId)
    .then((commits) => {
      /* update daily progess bar */
      let computedStyle = COMPUTE_STYLE(commits.dayCount, targetContributionCount * 1);
      document.getElementById('contribution-value-day').textContent = computedStyle.text;
      document.getElementById('progessBar-day').style.width = computedStyle.width;
      document.getElementById('progessBar-day').style.backgroundColor = computedStyle.color;

      /* request background page to update the badge */
      msg.bg('updateBadgeText', undefined, {
        text: commits.dayCount.toString(),
        color: computedStyle.color
      });

      /* update weekly progess bar */
      computedStyle = COMPUTE_STYLE(commits.weekCount, targetContributionCount * 7);
      document.getElementById('contribution-value-week').textContent = computedStyle.text;
      document.getElementById('progessBar-week').style.width = computedStyle.width;
      document.getElementById('progessBar-week').style.backgroundColor = computedStyle.color;

      /* update monthly progess bar */
      computedStyle = COMPUTE_STYLE(commits.monthCount,
        targetContributionCount * moment().daysInMonth());
      document.getElementById('contribution-value-month').textContent = computedStyle.text;
      document.getElementById('progessBar-month').style.width = computedStyle.width;
      document.getElementById('progessBar-month').style.backgroundColor = computedStyle.color;
    });
};

/* update avatar image, userId & link to github profile page */
const UPDATE_AVATAR = (githubId) => {
  document.getElementById('userPanel-link').href = `https://www.github.com/${githubId}`;
  document.getElementById('userPanel-link').textContent = `${githubId}'s`;
  document.getElementById('userPanel-avatar').src = `https://avatars0.githubusercontent.com/${githubId}`;
};

const UPDATE_MONTH_LABEL = () => {
  document.getElementById('contribution-title-month').textContent = `Month of ${moment().format('MMMM')}`;
};

/* --------------------------------------
 FORM UI HANDLING FUNCTIONS
-------------------------------------- */
const PREPOPULATE_INPUT_FIELDS = () => {
  const data = store.load();
  if (data) {
    const { targetContributionCount, githubId } = data;
    document.getElementById('form-idInput').value = githubId;
    document.getElementById('form-contributionInput').value = targetContributionCount;
  }
};

const CLEAR_INPUT_FIELDS = () => {
  document.getElementById('form-idInput').value = '';
  document.getElementById('form-contributionInput').value = '';
};

/* --------------------------------------
 DATA HANDLING FUNCTIONS
-------------------------------------- */
const SAVE_DATA = () => {
  const githubId = document.getElementById('form-idInput').value;
  const targetContributionCount = parseInt(document.getElementById('form-contributionInput').value, 10);
  store.save({ githubId, targetContributionCount });
};

const SYNC_BACKGROUND_DATA = () => {
  msg.bg('syncData'); /* request background to update their local data */
};

/* --------------------------------------
 VIEW TOGGLING FUNCTIONS
-------------------------------------- */
const SHOW_MAIN_VIEW = () => {
  document.getElementById('mainView').style.display = 'block';
  document.getElementById('settingsView').style.display = 'none';

  // Check if we have user's has a config stored locally
  const data = store.load();
  if (data) {
    document.getElementById('userPanel-info').style.display = 'block';
    document.getElementById('userPanel-configureBtn').style.display = 'none';
  } else {
    document.getElementById('userPanel-info').style.display = 'none';
    document.getElementById('userPanel-configureBtn').style.display = 'block';
  }
};

const SHOW_FORM_VIEW = () => {
  document.getElementById('mainView').style.display = 'none';
  document.getElementById('settingsView').style.display = 'flex';

  /* Focus on first input field in the form */
  document.getElementById('form-idInput').focus();
};

const UPDATE_MAIN_VIEW = () => {
  const data = store.load();
  if (data) {
    const { targetContributionCount, githubId } = data;
    UPDATE_CONTRIBUTIONS({ githubId, targetContributionCount });
    UPDATE_AVATAR(githubId);
  }
};

/* --------------------------------------
 GITHUB ID CHECKING FUNCTIONS
-------------------------------------- */
const FORMVIEW_SHOW_AVATAR = () => {
  document.getElementById('form-avatar').style.display = 'block';
  document.getElementById('form-avatar-spinner').style.display = 'none';
};
const FORMVIEW_SHOW_SPINNER = () => {
  document.getElementById('form-avatar').style.display = 'none';
  document.getElementById('form-avatar-spinner').style.display = 'block';
};
const FORMVIEW_SHOW_VALID_ICON = () => {
  document.getElementById('form-id-valid').style.display = 'block';
  document.getElementById('form-id-invalid').style.display = 'none';
};
const FORMVIEW_SHOW_INVALID_ICON = () => {
  document.getElementById('form-id-valid').style.display = 'none';
  document.getElementById('form-id-invalid').style.display = 'block';
};
const FORMVIEW_HIDE_ICONS = () => {
  document.getElementById('form-id-valid').style.display = 'none';
  document.getElementById('form-id-invalid').style.display = 'none';
};
const FORMVIEW_ENABLE_SUBMIT_BTN = () => {
  document.getElementById('form-submitBtn').disabled = false;
};
const FORMVIEW_DISABLE_SUBMIT_BTN = () => {
  document.getElementById('form-submitBtn').disabled = true;
};

const IS_GITHUBID_VALID = () => {
  FORMVIEW_HIDE_ICONS();
  FORMVIEW_SHOW_SPINNER();
  FORMVIEW_DISABLE_SUBMIT_BTN();
  const inputGithubId = document.getElementById('form-idInput').value;
  const config = {
    baseURL: 'https://www.github.com/users',
    validateStatus: status => (status === 200)
  };

  axios.get(`${inputGithubId}/contributions`, config)
    .then(() => {
      /* user exists! */
      document.getElementById('form-avatar').src = `https://avatars0.githubusercontent.com/${inputGithubId}`;
      FORMVIEW_SHOW_AVATAR();
      FORMVIEW_SHOW_VALID_ICON();
      FORMVIEW_ENABLE_SUBMIT_BTN();
    })
    .catch(() => {
      /* user doesn't exist! */
      document.getElementById('form-avatar').src = '../images/avatar.png';
      FORMVIEW_SHOW_AVATAR();
      FORMVIEW_SHOW_INVALID_ICON();
      FORMVIEW_DISABLE_SUBMIT_BTN();
    });
};

const DEBOUNCED_GITHUBID_IS_VALID = _.debounce(() => {
  IS_GITHUBID_VALID();
}, 1000);

window.onload = () => {
  /* --------------------------------------
   ATTACHING EVENT LISTENERS
  -------------------------------------- */
  document.getElementById('userPanel-editBtn').addEventListener('click', () => {
    PREPOPULATE_INPUT_FIELDS();
    IS_GITHUBID_VALID();
    SHOW_FORM_VIEW();
  });

  document.getElementById('userPanel-configureBtn').addEventListener('click', () => {
    document.getElementById('form-avatar').src = '../images/avatar.png';
    FORMVIEW_SHOW_AVATAR();
    FORMVIEW_HIDE_ICONS();
    FORMVIEW_DISABLE_SUBMIT_BTN();
    SHOW_FORM_VIEW();
  });

  document.getElementById('form-idInput').addEventListener('input', () => {
    DEBOUNCED_GITHUBID_IS_VALID();
  });

  document.getElementById('form-cancelBtn').addEventListener('click', () => {
    SHOW_MAIN_VIEW();
    CLEAR_INPUT_FIELDS();
  });

  document.getElementById('form-submitBtn').addEventListener('click', () => {
    SAVE_DATA();
    UPDATE_MAIN_VIEW();
    SHOW_MAIN_VIEW();
    CLEAR_INPUT_FIELDS();
    SYNC_BACKGROUND_DATA();
  });

  /* --------------------------------------
   START OF APPLICATION
  -------------------------------------- */
  UPDATE_MONTH_LABEL();
  SHOW_MAIN_VIEW();
  UPDATE_MAIN_VIEW();
  SYNC_BACKGROUND_DATA();
};
