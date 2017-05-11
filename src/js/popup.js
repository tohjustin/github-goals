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
  document.getElementById('user-link').href = `https://www.github.com/${githubId}`;
  document.getElementById('user-link').textContent = `${githubId}'s`;
  document.getElementById('user-avatar').src = `https://avatars0.githubusercontent.com/${githubId}`;
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
    document.getElementById('formView-id').value = githubId;
    document.getElementById('formView-count').value = targetContributionCount;
  }
};

const CLEAR_INPUT_FIELDS = () => {
  document.getElementById('formView-id').value = '';
  document.getElementById('formView-count').value = '';
};

/* --------------------------------------
 DATA HANDLING FUNCTIONS
-------------------------------------- */
const SAVE_DATA = () => {
  const githubId = document.getElementById('formView-id').value;
  const targetContributionCount = parseInt(document.getElementById('formView-count').value, 10);
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
  document.getElementById('formView').style.display = 'none';

  const data = store.load();
  if (data) {
    document.getElementById('description-configured').style.display = 'block';
    document.getElementById('description-unconfigured').style.display = 'none';
  } else {
    document.getElementById('description-configured').style.display = 'none';
    document.getElementById('description-unconfigured').style.display = 'block';
  }
};

const SHOW_FORM_VIEW = () => {
  document.getElementById('mainView').style.display = 'none';
  document.getElementById('formView').style.display = 'block';

  /* Focus on first input field in the form */
  document.getElementById('formView-id').focus();
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
  document.getElementById('formView-avatar').style.display = 'block';
  document.getElementById('formView-avatar-spinner').style.display = 'none';
};
const FORMVIEW_SHOW_SPINNER = () => {
  document.getElementById('formView-avatar').style.display = 'none';
  document.getElementById('formView-avatar-spinner').style.display = 'block';
};
const FORMVIEW_SHOW_VALID_ICON = () => {
  document.getElementById('avatar-valid').style.display = 'block';
  document.getElementById('avatar-invalid').style.display = 'none';
};
const FORMVIEW_SHOW_INVALID_ICON = () => {
  document.getElementById('avatar-valid').style.display = 'none';
  document.getElementById('avatar-invalid').style.display = 'block';
};
const FORMVIEW_HIDE_ICONS = () => {
  document.getElementById('avatar-valid').style.display = 'none';
  document.getElementById('avatar-invalid').style.display = 'none';
};
const FORMVIEW_ENABLE_SUBMIT_BTN = () => {
  document.getElementById('formView-submit').disabled = false;
};
const FORMVIEW_DISABLE_SUBMIT_BTN = () => {
  document.getElementById('formView-submit').disabled = true;
};

const IS_GITHUBID_VALID = () => {
  FORMVIEW_HIDE_ICONS();
  FORMVIEW_SHOW_SPINNER();
  FORMVIEW_DISABLE_SUBMIT_BTN();
  const inputGithubId = document.getElementById('formView-id').value;
  const config = {
    baseURL: 'https://www.github.com/users',
    validateStatus: status => (status === 200)
  };

  axios.get(`${inputGithubId}/contributions`, config)
    .then(() => {
      /* user exists! */
      document.getElementById('formView-avatar').src = `https://avatars0.githubusercontent.com/${inputGithubId}`;
      FORMVIEW_SHOW_AVATAR();
      FORMVIEW_SHOW_VALID_ICON();
      FORMVIEW_ENABLE_SUBMIT_BTN();
    })
    .catch(() => {
      /* user doesn't exist! */
      document.getElementById('formView-avatar').src = '../images/avatar.png';
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
  document.getElementById('user-editBtn').addEventListener('click', () => {
    PREPOPULATE_INPUT_FIELDS();
    IS_GITHUBID_VALID();
    SHOW_FORM_VIEW();
  });

  document.getElementById('user-configureBtn').addEventListener('click', () => {
    document.getElementById('formView-avatar').src = '../images/avatar.png';
    FORMVIEW_SHOW_AVATAR();
    FORMVIEW_HIDE_ICONS();
    FORMVIEW_DISABLE_SUBMIT_BTN();
    SHOW_FORM_VIEW();
  });

  document.getElementById('formView-id').addEventListener('input', () => {
    DEBOUNCED_GITHUBID_IS_VALID();
  });

  document.getElementById('formView-cancel').addEventListener('click', () => {
    SHOW_MAIN_VIEW();
    CLEAR_INPUT_FIELDS();
  });

  document.getElementById('formView-submit').addEventListener('click', () => {
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
