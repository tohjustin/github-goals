import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';

const contributions = {};

const getDays = username =>
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
        const commmitCounts = htmlContent('rect[class=day]').map((index, e) => {
          const { attribs: { 'data-count': count, 'data-date': date } } = e;
          return { count, date };
        });

        resolve(commmitCounts);
      })
      .catch(error => reject(error));
  });

contributions.daily = username =>
  getDays(username)
    .then((days) => {
      const todayDateStr = moment().format('YYYY-MM-DD');
      const index = days.length - 1;
      let commitCount = parseInt(days[index].count, 10);

      // If latest entry in Github's commit graph isn't the current browser's date,
      // we also include the commits from previous day.
      commitCount = (days[index].date === todayDateStr) ? commitCount :
        commitCount + parseInt(days[index - 1].count, 10);

      return commitCount;
    })
    .catch(() => -1);

export default contributions;
