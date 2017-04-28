import contributions from './modules/git-contribution';

// Scraps & update commit count every 2 minutes
const INTERVAL = 2 * 60;

const setBadgeText = (text) => {
  chrome.browserAction.setBadgeText({ text });
};

const setBadgeBackgroundColor = (color) => {
  chrome.browserAction.setBadgeBackgroundColor({ color });
};

const retrieveDailyCommitCount = (username) => {
  contributions.daily(username)
    .then((commitCount) => {
      setBadgeBackgroundColor((commitCount !== 0) ? '#F14436' : '#666666');
      setBadgeText(commitCount.toString());
      console.log(commitCount); // eslint-disable-line no-console
    })
    .catch((err) => {
      setBadgeText('X');
      console.log('ERROR', err); // eslint-disable-line no-console
    });
};

/* Configure extension to scrap & update commit count periodically */
setInterval(() => {
  retrieveDailyCommitCount('tohjustin');
}, INTERVAL * 1000);

retrieveDailyCommitCount('tohjustin');
