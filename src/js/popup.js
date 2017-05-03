import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';

import _msg from './modules/msg';
import * as store from './modules/store';
import * as theme from './modules/theme';
import * as contributions from './modules/git-contribution';

const msg = _msg.init('popup');

/* --------------------------------------
 MAIN UI HANDLING FUNCTIONS
-------------------------------------- */
/* compute CSS styles for progress bar */
const COMPUTE_STYLE = (count, totalCount) => {
  const text = `${count}/${totalCount} commits`;
  const percentage = Math.round((count / totalCount) * 100);
  const width = `${(percentage > 100) ? 100 : percentage}%`;
  const color = theme.getColor(percentage);
  return { color, text, width };
};

const UPDATE_CONTRIBUTIONS = ({ githubId, targetContributionCount }) => {
  contributions.getContributionsSummary(githubId)
    .then((commits) => {
      /* update daily progess bar */
      let computedStyle = COMPUTE_STYLE(commits.dayCount, targetContributionCount * 1);
      document.getElementById('day-value').textContent = computedStyle.text;
      document.getElementById('day-progessBar').style.width = computedStyle.width;
      document.getElementById('day-progessBar').style.backgroundColor = computedStyle.color;

      /* request background page to update the badge */
      msg.bg('updateBadgeText', undefined, {
        text: commits.dayCount.toString(),
        color: computedStyle.color
      });

      /* update weekly progess bar */
      computedStyle = COMPUTE_STYLE(commits.weekCount, targetContributionCount * 7);
      document.getElementById('week-value').textContent = computedStyle.text;
      document.getElementById('week-progessBar').style.width = computedStyle.width;
      document.getElementById('week-progessBar').style.backgroundColor = computedStyle.color;

      /* update monthly progess bar */
      computedStyle = COMPUTE_STYLE(commits.monthCount,
        targetContributionCount * moment().daysInMonth());
      document.getElementById('month-value').textContent = computedStyle.text;
      document.getElementById('month-progessBar').style.width = computedStyle.width;
      document.getElementById('month-progessBar').style.backgroundColor = computedStyle.color;
    });
};

/* update avatar image, userId & link to github profile page */
const UPDATE_AVATAR = (githubId) => {
  document.getElementById('user-link').href = `https://www.github.com/${githubId}`;
  document.getElementById('user-link').textContent = `${githubId}'s`;
  document.getElementById('user-avatar').src = `https://avatars0.githubusercontent.com/${githubId}`;
};

const UPDATE_MONTH_LABEL = () => {
  document.getElementById('month-name').textContent = `Month of ${moment().format('MMMM')}`;
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

const GITHUBID_IS_VALID = () => {
  FORMVIEW_SHOW_SPINNER();
  FORMVIEW_HIDE_ICONS();
  const inputGithubId = document.getElementById('formView-id').value;
  const config = {
    baseURL: 'https://avatars0.githubusercontent.com/',
    validateStatus: status => (status === 200)
  };

  axios.get(`${inputGithubId}`, config)
    .then(() => {
      /* user exists! */
      document.getElementById('formView-avatar').src = `https://avatars0.githubusercontent.com/${inputGithubId}`;
      FORMVIEW_SHOW_AVATAR();
      FORMVIEW_SHOW_VALID_ICON();
    })
    .catch(() => {
      /* user doesn't exist! */
      document.getElementById('formView-avatar').src = '../images/avatar.png';
      FORMVIEW_SHOW_AVATAR();
      FORMVIEW_SHOW_INVALID_ICON();
    });
};

const DEBOUNCED_GITHUBID_IS_VALID = _.debounce(() => {
  GITHUBID_IS_VALID();
}, 1000);

/* --------------------------------------
 ATTACHING EVENT LISTENERS
-------------------------------------- */
document.getElementById('user-editBtn').addEventListener('click', () => {
  PREPOPULATE_INPUT_FIELDS();
  GITHUBID_IS_VALID();
  SHOW_FORM_VIEW();
});

document.getElementById('user-configureBtn').addEventListener('click', () => {
  SHOW_FORM_VIEW();
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

document.getElementById('formView-id').addEventListener('input', () => {
  DEBOUNCED_GITHUBID_IS_VALID();
});

/* --------------------------------------
 START OF APPLICATION
-------------------------------------- */
UPDATE_MONTH_LABEL();
UPDATE_MAIN_VIEW();
SHOW_MAIN_VIEW();
