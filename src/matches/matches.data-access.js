const rp = require("request-promise");
const cheerio = require("cheerio");
const url = require("url");
const fetch = require("node-fetch");
const moment = require("moment");

const source = {
  domain: "http://www.snooker.org",
  liveScoresPath: "/res/index.asp?template=21&event=",
  resultsPath: "/res/index.asp?template=22&event=",
  api: "http://api.snooker.org",
  event: "/?e=",
  events: "/?t=6&e=",
  players: "/?t=9&e="
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
      console.error(err);
    });
}

function api() {
  return new Promise(function(resolve, reject) {
    getPath()
      .then(path => {
        eventId = new URLSearchParams(
          url.parse(source.domain + path).query
        ).get("event");

        return fetch(source.api.concat(source.events).concat(eventId));
      })
      .then(data => {
        return data.json();
      })
      .then(tournamentMatches => {
        let filteredByDate = tournamentMatches.filter(match => {
          return (
            match.ScheduledDate.substring(0, 10) ===
            moment().format("YYYY-MM-DD")
          );
        });
        return filteredByDate;
      })
      .then(filteredMatches => {
        return fetch(source.api.concat(source.players).concat(eventId))
          .then(res => {
            return res.json();
          })
          .then(playersData => {
            return {
              matches: filteredMatches,
              players: playersData
            };
          })
          .catch(err => {
            console.error(err);
          });
      })
      .then(matchAndPlayers => {
        transformedMatches = matchAndPlayers.matches.map(match => {
          match.player1 = matchAndPlayers.players.filter(player => {
            return player.ID === match.Player1ID;
          })[0];

          match.player2 = matchAndPlayers.players.filter(player => {
            return player.ID === match.Player2ID;
          })[0];
          return match;
        });
        return transformedMatches;
      })
      .then(transformedMatches => {
        return fetch(source.api.concat(source.event).concat(eventId))
          .then(res => {
            return res.json();
          })
          .then(eventData => {
            return {
              matches: transformedMatches,
              tournament: eventData[0],
              urls: {
                domain: source.domain,
                liveScores: source.liveScoresPath + eventData[0].ID,
                results: source.resultsPath + eventData[0].ID
              }
            };
          })
          .catch(err => {
            console.error(err);
          });
      })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = {
  getData: getData,
  source: source,
  api: api
};
