import moment from 'moment';
import _msg from './modules/msg';
import * as theme from './modules/theme';
import * as contributions from './modules/git-contribution';

const computeStyle = (count, totalCount) => {
  const text = `${count}/${totalCount} commits`;
  const percentage = Math.round((count / totalCount) * 100);
  const width = `${(percentage > 100) ? 100 : percentage}%`;
  const color = theme.getColor(percentage);
  return { color, text, width };
};

const updateContributions = ({ githubUsername, targetContributionCount }) => {
  contributions.getContributionsSummary(githubUsername)
    .then((commits) => {
      let computedStyle;
      computedStyle = computeStyle(commits.dayCount, targetContributionCount);
      document.getElementById('day-value').textContent = computedStyle.text;
      document.getElementById('day-progessBar').style.width = computedStyle.width;
      document.getElementById('day-progessBar').style.backgroundColor = computedStyle.color;

      computedStyle = computeStyle(commits.weekCount, targetContributionCount * 7);
      document.getElementById('week-value').textContent = computedStyle.text;
      document.getElementById('week-progessBar').style.width = computedStyle.width;
      document.getElementById('week-progessBar').style.backgroundColor = computedStyle.color;

      computedStyle = computeStyle(commits.monthCount,
        targetContributionCount * moment().daysInMonth());
      document.getElementById('month-name').textContent = `Month of ${moment().format('MMMM')}`;
      document.getElementById('month-value').textContent = computedStyle.text;
      document.getElementById('month-progessBar').style.width = computedStyle.width;
      document.getElementById('month-progessBar').style.backgroundColor = computedStyle.color;
    });
};

const updateAvatar = (githubUsername) => {
  document.getElementById('user-link').href = `https://www.github.com/${githubUsername}`;
  document.getElementById('user-link').textContent = `${githubUsername}'s`;
  document.getElementById('user-avatar').src = `https://avatars0.githubusercontent.com/${githubUsername}`;
};

const msg = _msg.init('popup');
msg.bg('getUserData', ({ githubUsername, targetContributionCount }) => {
  updateContributions({ githubUsername, targetContributionCount });
  updateAvatar(githubUsername);
});
