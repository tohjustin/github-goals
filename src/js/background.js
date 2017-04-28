import contributions from './modules/git-contribution';

// Scraps & update commit count every 'INTERVAL' amount of seconds
const INTERVAL = 30;

const setBadgeText = (text) => {
  chrome.browserAction.setBadgeText({ text });
};

const setBadgeBackgroundColor = (color) => {
  chrome.browserAction.setBadgeBackgroundColor({ color });
};

const retrieveDailyCommitCount = (username) => {
  contributions.daily(username)
    .then((commitCount) => {
      console.log(commitCount); // eslint-disable-line no-console
      setBadgeText(commitCount.toString());
    })
    .catch((err) => {
      setBadgeText('X');
      console.log('ERROR', err); // eslint-disable-line no-console
    });
};

setInterval(() => {
  retrieveDailyCommitCount('tohjustin');
}, INTERVAL * 1000);

setBadgeBackgroundColor('#F34336');
retrieveDailyCommitCount('tohjustin');
