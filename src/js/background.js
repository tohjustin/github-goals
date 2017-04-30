import _msg from './modules/msg';
import * as contributions from './modules/git-contribution';
import * as store from './modules/store';
import * as theme from './modules/theme';

/* --------------------------------------
 GLOBAL CONSTANTS & VARS (bad practice T_T)
-------------------------------------- */
const UPDATE_INTERVAL = 2 * 60 * 1000; // 2 mins
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

/* updates extension's badge */
const UPDATE_BADGE = (githubId, value) => {
  if (value) {
    chrome.browserAction.setBadgeBackgroundColor({ color: value.color });
    chrome.browserAction.setBadgeText({ text: value.text });
  } else {
    contributions.getContributionsOfTheDay(githubId)
      .then((commitCount) => {
        if (commitCount) {
          chrome.browserAction.setBadgeBackgroundColor({
            color: theme.getColor(Math.round((commitCount / TARGET_CONTRIBUTION_COUNT) * 100))
          });
          chrome.browserAction.setBadgeText({
            text: commitCount.toString()
          });
        } else {
          chrome.browserAction.setBadgeBackgroundColor({ color: theme.getColor(0) });
          chrome.browserAction.setBadgeText({ text: '?' });
        }
      })
      .catch(() => {
        console.log('[UPDATE_BADGE, contributions.getContributionsOfTheDay] ERROR!');
      });
  }
};

/* scrap & update commit count periodically + configure it to repeat it periodically */
const INIT_WORKER = (githubId, updateInterval) =>
  setInterval(() => { UPDATE_BADGE(githubId); }, updateInterval);

/* --------------------------------------
 START OF APPLICATION
-------------------------------------- */
/* initialize message-passing module to listen for popup events */
_msg.init('bg', {
  updateData: () => {
    if (SYNC_USERDATA() === true) {
      UPDATE_BADGE(GITHUB_USERNAME);
      clearInterval(BACKGROUND_WORKER);
      BACKGROUND_WORKER = INIT_WORKER(GITHUB_USERNAME, UPDATE_INTERVAL);
    }
  },
  updateBadgeText: (done, { text, color }) => {
    UPDATE_BADGE(GITHUB_USERNAME, { text, color });
  }
});

if (SYNC_USERDATA() === true) {
  UPDATE_BADGE(GITHUB_USERNAME);
  clearInterval(BACKGROUND_WORKER);
  BACKGROUND_WORKER = INIT_WORKER(GITHUB_USERNAME, UPDATE_INTERVAL);
}
