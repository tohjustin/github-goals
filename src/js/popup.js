import moment from 'moment';
import _msg from './modules/msg';
import * as contributions from './modules/git-contribution';

const msg = _msg.init('popup');
const GOAL_AMOUNT = 10;

msg.bg('getUser', (username) => {
  console.log(username);
});

const computeStyle = (count, totalCount) => {
  const text = `${count}/${totalCount}`;
  const result = Math.round((count / totalCount) * 100);
  const width = `${(result > 100) ? 100 : result}%`;

  let color;
  if (result >= 125) {
    color = '#8F2CFA';
  } else if (result >= 66) {
    color = '#7ED321';
  } else if (result >= 33) {
    color = '#F5A623';
  } else {
    color = '#F40F2B';
  }
  return { color, text, width };
};

contributions.getContributionsSummary('tohjustin')
  .then((commits) => {
    let computedStyle;
    computedStyle = computeStyle(commits.dayCount, GOAL_AMOUNT);
    document.getElementById('day-value').textContent = computedStyle.text;
    document.getElementById('day-progessBar').style.width = computedStyle.width;
    document.getElementById('day-progessBar').style.backgroundColor = computedStyle.color;

    computedStyle = computeStyle(commits.weekCount, GOAL_AMOUNT * 7);
    document.getElementById('week-value').textContent = computedStyle.text;
    document.getElementById('week-progessBar').style.width = computedStyle.width;
    document.getElementById('week-progessBar').style.backgroundColor = computedStyle.color;

    computedStyle = computeStyle(commits.monthCount, GOAL_AMOUNT * moment().daysInMonth());
    document.getElementById('month-value').textContent = computedStyle.text;
    document.getElementById('month-progessBar').style.width = computedStyle.width;
    document.getElementById('month-progessBar').style.backgroundColor = computedStyle.color;
  });
