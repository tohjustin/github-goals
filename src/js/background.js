import chromeMessaging from 'modules/chromeMessaging';
import * as githubScraper from 'modules/githubScraper';
import * as store from 'modules/store';
import { convertPercentageToColor } from 'modules/utils';

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
    SET_BADGE({ color: convertPercentageToColor(0), text: '?' });
    return;
  }

  githubScraper.getContributionsOfTheDay(githubId)
    .then((commitCount) => {
      if (commitCount > -1) {
        const percentage = Math.round((commitCount / TARGET_CONTRIBUTION_COUNT) * 100);
        const color = convertPercentageToColor(percentage);
        const text = commitCount.toString();
        SET_BADGE({ color, text });
      } else {
        SET_BADGE({ color: convertPercentageToColor(0), text: '?' });
      }
    })
    .catch(() => {
      console.log('[UPDATE_BADGE, githubScraper.getContributionsOfTheDay] ERROR!');
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
  BACKGROUND_WORKER = setInterval(() => {
    SYNC_USERDATA();
    SCRAPE_AND_UPDATE_BADGE(githubId);
  }, updateInterval);
}

/* --------------------------------------
 START OF APPLICATION
-------------------------------------- */
/* initialize message-passing module to listen for popup events */
chromeMessaging.init('bg', {
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
