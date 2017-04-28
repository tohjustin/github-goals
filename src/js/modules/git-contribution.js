/* eslint-disable */
import https from 'https';
import cheerio from 'cheerio';
import moment from 'moment';

var body;
var $;
var days;

const contributions = {};

var getDays = function(username) {
	return new Promise(function(resolve, reject) {
		var url;
		if (username) {
			url = `https://github.com/users/${username}/contributions`;
		}
		else {
			reject('No username provided');
		}
		https.get(url, function(res) {
			res.setEncoding('utf8');
			res.on('data', function(data) {
				body += data;
			})

			if (res.statusCode !== 200) {
				reject(res.statusCode)
			}

			res.on('end', function() {
				$ = cheerio.load(body, { ignoreWhitespace: true, decodeEntities: true });
				var weeks = $('g', 'g');
				days = $('rect', weeks);
				resolve(days);
			})
		}).on('error', function(err) {
			reject(err);
		})
	})
}

contributions.daily = function(username) {
	return new Promise((resolve, reject) => {
		getDays(username).then((days) => {
			const todayDateStr = moment().format('YYYY-MM-DD');
			const index = days.length-1;
			let commitCount = parseInt($(days[index]).attr('data-count'));

			// If latest entry in Github's commit graph isn't the current browser's date,
			// we also include the commits from previous day.
			commitCount = (days[index].attribs['data-date'] === todayDateStr) ? commitCount :
				commitCount + parseInt($(days[index-1]).attr('data-count'));

			resolve(commitCount);
		});
	})
}

export default contributions;
