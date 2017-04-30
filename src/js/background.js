import * as contributions from './modules/git-contribution';
import _msg from './modules/msg';
import * as theme from './modules/theme';

/* Scraps & update commit count every 2 minutes */
const UPDATE_INTERVAL = 2 * 60 * 1000;
const TARGET_CONTRIBUTION_COUNT = 10;
const GITHUB_USERNAME = 'tohjustin';

const updateBadge = (username, value) => {
  if (value) {
    const { color, text } = value;
    chrome.browserAction.setBadgeBackgroundColor({ color });
    chrome.browserAction.setBadgeText({ text });
  } else {
    contributions.getContributionsOfTheDay(username)
      .then((commitCount) => {
        chrome.browserAction.setBadgeBackgroundColor({
          color: theme.getColor(Math.round((commitCount / TARGET_CONTRIBUTION_COUNT) * 100))
        });
        chrome.browserAction.setBadgeText({
          text: commitCount.toString()
        });
      })
      .catch(() => {
        chrome.browserAction.setBadgeText({ text: 'X' });
      });
  }
};

_msg.init('bg', {
  getUserData: (done) => {
    done({
      githubUsername: GITHUB_USERNAME,
      targetContributionCount: TARGET_CONTRIBUTION_COUNT
    });
  },
  updateBadgeText: (done, params) => {
    updateBadge(GITHUB_USERNAME, params);
  }
});

/* Configure extension to scrap & update commit count periodically */
setInterval(() => {
  updateBadge(GITHUB_USERNAME);
}, UPDATE_INTERVAL);

updateBadge(GITHUB_USERNAME);
