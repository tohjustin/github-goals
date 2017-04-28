import contributions from './modules/git-contribution';

function setBadgeText(text) {
  chrome.browserAction.setBadgeText({ text });
}

contributions.daily('tohjustin')
  .then((commitCount) => {
    console.log(commitCount); // eslint-disable-line no-console
    setBadgeText(commitCount.toString());
  })
  .catch((err) => {
    setBadgeText('X');
    console.log('ERROR', err); // eslint-disable-line no-console
  });
