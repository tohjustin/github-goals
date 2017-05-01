import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
import * as store from './store';

export const getAllContributions = username =>
  new Promise((resolve, reject) => {
    const config = {
      baseURL: 'https://github.com/users/',
      validateStatus: status => (status === 200)
    };

    axios.get(`${username}/contributions`, config)
      .then((response) => {
        /* Grab HTML content */
        const htmlContent = cheerio.load(response.data, {
          ignoreWhitespace: true,
          decodeEntities: true
        });

        /* Parse content */
        const contributionData = htmlContent('rect[class=day]').map((index, e) => {
          const { attribs: { 'data-count': count, 'data-date': date } } = e;
          return { count, date };
        });

        resolve(contributionData);
      })
      .catch((error) => {
        store.reset();
        reject(error);
      });
  });

export const getContributionsOfTheDay = username =>
  getAllContributions(username)
    .then((contributionData) => {
      const todayDateStr = moment().format('YYYY-MM-DD');
      const index = contributionData.length - 1;
      let commitCount = parseInt(contributionData[index].count, 10);

      // If latest entry in Github's commit graph isn't the current browser's date,
      // we also include the commits from previous day.
      commitCount = (contributionData[index].date === todayDateStr) ? commitCount :
        commitCount + parseInt(contributionData[index - 1].count, 10);

      return commitCount;
    })
    .catch(() => -1);

export const getContributionsSummary = username =>
  getAllContributions(username)
    .then((contributionData) => {
      const today = moment().format('YYYY-MM-DD');
      const firstDayOfWeek = moment().startOf('week').format('YYYY-MM-DD');
      const firstDayOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      const index = contributionData.length - 1;

      let dayCount = 0;
      for (let i = index; i > 0; i -= 1) {
        dayCount += parseInt(contributionData[i].count, 10);
        if (contributionData[i].date === today) {
          break;
        }
      }

      let weekCount = 0;
      for (let i = index; i > 0; i -= 1) {
        weekCount += parseInt(contributionData[i].count, 10);
        if (contributionData[i].date === firstDayOfWeek) {
          break;
        }
      }

      let monthCount = 0;
      for (let i = index; i > 0; i -= 1) {
        monthCount += parseInt(contributionData[i].count, 10);
        if (contributionData[i].date === firstDayOfMonth) {
          break;
        }
      }

      return { dayCount, weekCount, monthCount };
    })
    .catch(() => ({}));
