const rp = require("request-promise");
const cheerio = require("cheerio");

const source = {
  domain: "http://www.snooker.org"
};

const options = {
  uri: source.domain,
  transform: transform
};

function transform(body) {
  return cheerio.load(body);
}

function getData(options) {
  return rp(options);
}

function getPath() {
  return getData(options)
    .then($ => {
      var path = $("a:contains('Upcoming matches')")
        .first()
        .attr("href");

      return path;
    })
    .catch(err => {
      console.log(err);
    });
}

function get() {
  return new Promise(function(resolve, reject) {
    getPath().then((path = "/res/index.asp?template=24&numperpage=100") => {
      getData({ uri: source.domain + path, transform: transform })
        .then($ => {
          var liveScoresPath = $("a:contains('live scores')").attr("href");
          var resultsPath = $("a:contains('live scores')").attr("href");
          var tournament = $("table#latest > thead > tr > th")
            .text()
            .trim();
          var matches = [];
          $("table#latest > tbody > tr").each((i, item) => {
            var match = {
              player: $("td.player:nth-child(3)", item)
                .text()
                .replace("(a)", "")
                .replace(/\[(.*?)\]/, "")
                .trim(),
              opponent: $("td.player:nth-child(8)", item)
                .text()
                .replace("(a)", "")
                .replace(/\[(.*?)\]/, "")
                .trim(),
              time: $("td.scheduled", item)
                .text()
                .trim()
            };
            matches.push(match);
          });

          return {
            matches: matches,
            tournament: tournament,
            urls: {
              domain: source.domain,
              liveScores: liveScoresPath,
              results: resultsPath
            }
          };
        })
        .then(dailyUpdate => {
          resolve(dailyUpdate);
        })
        .catch(err => {
          reject(err);
        });
    });
  });
}

module.exports = {
  get: get,
  getData: getData,
  source: source
};
