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
/* updates extension's badge */
const SET_BADGE = ({ color, text }) => {
  chrome.browserAction.setBadgeBackgroundColor({ color });
  chrome.browserAction.setBadgeText({ text });
};

const SCRAPE_AND_UPDATE_BADGE = (githubId) => {
  if (githubId === undefined) {
    SET_BADGE({ color: theme.getColor(0), text: '?' });
    return;
  }

  contributions.getContributionsOfTheDay(githubId)
    .then((commitCount) => {
      if (commitCount > -1) {
        const color = theme.getColor(Math.round((commitCount / TARGET_CONTRIBUTION_COUNT) * 100));
        const text = commitCount.toString();
        SET_BADGE({ color, text });
      } else {
        SET_BADGE({ color: theme.getColor(0), text: '?' });
      }
    })
    .catch(() => {
      console.log('[UPDATE_BADGE, contributions.getContributionsOfTheDay] ERROR!');
    });
};

// Defined as non-arrow function so that we can update the Global variables
function SYNC_USERDATA() {
  const data = store.load();
  if (data) {
    TARGET_CONTRIBUTION_COUNT = data.targetContributionCount;
    GITHUB_USERNAME = data.githubId;
  }
}

/* scrap & update commit count periodically + configure it to repeat it periodically */
function INIT_WORKER(githubId, updateInterval) {
  clearInterval(BACKGROUND_WORKER);
  BACKGROUND_WORKER = setInterval(() => { SCRAPE_AND_UPDATE_BADGE(githubId); }, updateInterval);
}

/* --------------------------------------
 START OF APPLICATION
-------------------------------------- */
/* initialize message-passing module to listen for popup events */
_msg.init('bg', {
  syncData: () => {
    SYNC_USERDATA();
    SCRAPE_AND_UPDATE_BADGE(GITHUB_USERNAME);
    INIT_WORKER(GITHUB_USERNAME, UPDATE_INTERVAL);
  },
  updateBadgeText: (done, { text, color }) => {
    SET_BADGE({ text, color });
  }
});

SYNC_USERDATA();
SCRAPE_AND_UPDATE_BADGE(GITHUB_USERNAME);
INIT_WORKER(GITHUB_USERNAME, UPDATE_INTERVAL);
