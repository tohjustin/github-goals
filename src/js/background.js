import * as contributions from './modules/git-contribution';
import _msg from './modules/msg';

/* Scraps & update commit count every 2 minutes */
const UPDATE_INTERVAL = 2 * 60 * 1000;
const TARGET_CONTRIBUTION_COUNT = 10;
const GITHUB_USERNAME = 'tohjustin';
const COLOR_RED = '#F14436';
const COLOR_GREY = '#666666';

_msg.init('bg', {
  getUserData: (done) => {
    done({
      githubUsername: GITHUB_USERNAME,
      targetContributionCount: TARGET_CONTRIBUTION_COUNT
    });
  }
});

const updateBadge = (username) => {
  contributions.getContributionsOfTheDay(username)
    .then((commitCount) => {
      chrome.browserAction.setBadgeBackgroundColor({
        color: (commitCount !== 0) ? COLOR_RED : COLOR_GREY
      });
      chrome.browserAction.setBadgeText({
        text: commitCount.toString()
      });
    })
    .catch(() => {
      chrome.browserAction.setBadgeBackgroundColor({ color: COLOR_RED });
      chrome.browserAction.setBadgeText({ text: 'X' });
    });
};

/* Configure extension to scrap & update commit count periodically */
setInterval(() => {
  updateBadge(GITHUB_USERNAME);
}, UPDATE_INTERVAL);

updateBadge(GITHUB_USERNAME);
