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
  matchesInEvent: "/?t=6&e=",
  playersInEvent: "/?t=9&e=",
  roundsInEvent: "/?t=12&e="
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

        return eventId;
      })
      .then(eventId => {
        return fetch(source.api.concat(source.event).concat(eventId))
          .then(event => {
            return event.json();
          })
          .then(eventArray => {
            return eventArray[0];
          });
      })
      .then(event => {
        return fetch(source.api.concat(source.roundsInEvent).concat(event.ID))
          .then(rounds => {
            return rounds.json();
          })
          .then(rounds => {
            return {
              ...event,
              rounds: rounds
            };
          });
      })
      .then(eventWithRounds => {
        return fetch(
          source.api.concat(source.matchesInEvent).concat(eventWithRounds.ID)
        )
          .then(matches => {
            return matches.json();
          })
          .then(matches => {
            eventWithRounds.rounds = eventWithRounds.rounds.map(round => {
              return {
                ...round,
                matches: matches
                  .filter(match => {
                    return (
                      match.ScheduledDate.substring(0, 10) ===
                      moment().format("YYYY-MM-DD")
                    );
                  })
                  .filter(match => {
                    return round.Round === match.Round;
                  })
              };
            });

            return {
              ...eventWithRounds,
              urls: {
                domain: source.domain,
                liveScores: source.liveScoresPath + eventWithRounds.ID,
                results: source.resultsPath + eventWithRounds.ID
              }
            };
          });
      })
      .then(eventWithRoundsAndMatches => {
        eventWithRoundsAndMatches.rounds = eventWithRoundsAndMatches.rounds
          .filter(round => {
            return round.matches.length > 0;
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
        return eventWithRoundsAndMatches;
      })
      .then(eventsWithRoundsAndMatches => {
        return fetch(source.api.concat(source.playersInEvent).concat(eventId))
          .then(players => {
            return players.json();
          })
          .then(players => {
            eventsWithRoundsAndMatches.rounds = eventsWithRoundsAndMatches.rounds.map(
              round => {
                round.matches = round.matches.map(match => {
                  match.player1 = players.filter(player => {
                    return player.ID === match.Player1ID;
                  })[0];

                  match.player2 = players.filter(player => {
                    return player.ID === match.Player2ID;
                  })[0];

                  return match;
                });
                return round;
              }
            );

            return eventsWithRoundsAndMatches;
          });
      })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  });
}

module.exports = {
  getData: getData,
  source: source,
  api: api
};
