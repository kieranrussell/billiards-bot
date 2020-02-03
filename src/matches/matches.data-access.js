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
  players: "/?t=9&e=",
  round: "/?t=12&e="
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
      .then(eventWithMatches => {
        return eventWithMatches.json();
      })
      .then(eventWithMatches => {
        let filteredByDateMatches = eventWithMatches.filter(match => {
          return (
            match.ScheduledDate.substring(0, 10) ===
            moment().format("YYYY-MM-DD")
          );
        });
        return filteredByDateMatches;
      })
      .then(filteredByDateMatches => {
        return fetch(source.api.concat(source.players).concat(eventId))
          .then(res => {
            return res.json();
          })
          .then(playersData => {
            return {
              matches: filteredByDateMatches,
              players: playersData
            };
          })
          .catch(err => {
            console.error(err);
          });
      })
      .then(matchAndPlayers => {
        return fetch(source.api.concat(source.round).concat(eventId))
          .then(res => {
            return res.json();
          })
          .then(roundData => {
            return {
              ...matchAndPlayers,
              rounds: roundData
            };
          })
          .catch(err => {
            console.error(err);
          });
      })
      .then(matchAndPlayersAndRounds => {
        transformedMatches = matchAndPlayersAndRounds.matches.map(match => {
          match.player1 = matchAndPlayersAndRounds.players.filter(player => {
            return player.ID === match.Player1ID;
          })[0];

          match.player2 = matchAndPlayersAndRounds.players.filter(player => {
            return player.ID === match.Player2ID;
          })[0];

          return match;
        });

        roundBasedMatches = matchAndPlayersAndRounds.rounds.map(round => {
          round.matches = transformedMatches.filter(match => {
            return round.Round === match.Round;
          });

          return round;
        });

        return roundBasedMatches;
      })
      .then(roundBasedMatches => {
        return roundBasedMatches
          .filter(round => {
            return round.matches.length > 0;
          })
          .sort((round, next) => {
            return round.Round > next.Round;
          })
          .map(round => {
            round.matches = round.matches.sort((match, next) => {
              return (
                match.ScheduledDate.substring(11, 16).replace(":", "") >
                next.ScheduledDate.substring(11, 16).replace(":", "")
              );
            });
            return round;
          });
      })
      .then(filteredSortedRoundsWithSortedMatches => {
        return fetch(source.api.concat(source.event).concat(eventId))
          .then(res => {
            return res.json();
          })
          .then(eventData => {
            return {
              ...eventData[0],
              rounds: filteredSortedRoundsWithSortedMatches,
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
