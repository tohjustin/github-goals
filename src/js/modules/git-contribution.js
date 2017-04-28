import https from 'https';
import cheerio from 'cheerio';
import moment from 'moment';

const contributions = {};

const getDays = username =>
  new Promise((resolve, reject) => {
    const url = `https://github.com/users/${username}/contributions`;
    let body;

    https.get(url, (res) => {
      res.setEncoding('utf8');
      res.on('data', (data) => {
        body += data;
      });

      if (res.statusCode !== 200) {
        reject(res.statusCode);
      }

      res.on('end', () => {
        const $ = cheerio.load(body, { ignoreWhitespace: true, decodeEntities: true });
        const days = $('rect[class=day]').map((index, e) => {
          const { attribs: { 'data-count': count, 'data-date': date } } = e;
          return { count, date };
        });
        resolve(days);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });

contributions.daily = username =>
  new Promise((resolve) => {
    getDays(username).then((days) => {
      const todayDateStr = moment().format('YYYY-MM-DD');
      const index = days.length - 1;
      let commitCount = parseInt(days[index].count, 10);

      // If latest entry in Github's commit graph isn't the current browser's date,
      // we also include the commits from previous day.
      commitCount = (days[index].date === todayDateStr) ? commitCount :
        commitCount + parseInt(days[index - 1].count, 10);

      resolve(commitCount);
    });
  });

export default contributions;
