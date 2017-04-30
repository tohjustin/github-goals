import _msg from './modules/msg';
import * as contributions from './modules/git-contribution';
import * as store from './modules/store';
import * as theme from './modules/theme';

/* --------------------------------------
 GLOBAL CONSTANTS & VARS (bad practice T_T)
-------------------------------------- */
const UPDATE_INTERVAL = 2 * 60 * 1000;
let TARGET_CONTRIBUTION_COUNT;
let GITHUB_USERNAME;
let BACKGROUND_WORKER;

/* --------------------------------------
 MAIN FUNCTIONS
-------------------------------------- */
// Defined as non-arrow function so that we can update the Global variables
function SYNC_USERDATA() {
  const temp = store.load();
  if (temp) {
    const { targetContributionCount, githubId } = temp;
    TARGET_CONTRIBUTION_COUNT = targetContributionCount;
    GITHUB_USERNAME = githubId;
    return true;
  }

  return false;
}

const _UPDATE_BADGE = ({ color, text }) => {
  chrome.browserAction.setBadgeBackgroundColor({ color });
  chrome.browserAction.setBadgeText({ text });
};

/* updates extension's badge */
const UPDATE_BADGE = (githubId, value) => {
  if (value) {
    _UPDATE_BADGE(value);
  } else {
    contributions.getContributionsOfTheDay(githubId)
      .then((commitCount) => {
        _UPDATE_BADGE({
          color: theme.getColor(Math.round((commitCount / TARGET_CONTRIBUTION_COUNT) * 100)),
          text: commitCount.toString()
        });
      })
      .catch(() => {
        console.log('[UPDATE_BADGE, contributions.getContributionsOfTheDay] ERROR!');
      });
  }
};

/* scrap & update commit count periodically + configure it to repeat it periodically */
const START_WORKER = (githubId, updateInterval) => {
  if (BACKGROUND_WORKER) {
    clearInterval(BACKGROUND_WORKER);
  }
  return setInterval(() => {
    UPDATE_BADGE(githubId);
  }, updateInterval);
};

/* --------------------------------------
 START OF APPLICATION
-------------------------------------- */
/* initialize message-passing module to listen for popup events */
_msg.init('bg', {
  updateData: () => {
    if (SYNC_USERDATA() === true) {
      UPDATE_BADGE(GITHUB_USERNAME);
      BACKGROUND_WORKER = START_WORKER(GITHUB_USERNAME, UPDATE_INTERVAL);
    }
  },
  updateBadgeText: (done, { text, color }) => {
    UPDATE_BADGE(GITHUB_USERNAME, { text, color });
  }
});

if (SYNC_USERDATA() === true) {
  UPDATE_BADGE(GITHUB_USERNAME);
  BACKGROUND_WORKER = START_WORKER(GITHUB_USERNAME, UPDATE_INTERVAL);
}
