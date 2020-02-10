const matches = require("./matches.data-access");
const moment = require("moment");

//Submit post with daily matches for current tournament.
let lineBreak = "\n\n&nbsp;\n\n";
let postScript = "^(1. Times are in GMT, click for a local time conversion.)";

function getDailyTournamentPostViaApi() {
  return new Promise((resolve, reject) => {
    matches
      .api()
      .then(tournament => {
        let info =
          getRedditFormatLink(
            "Live scores",
            tournament.urls.domain + tournament.urls.liveScores
          ) +
          "\n" +
          getRedditFormatLink(
            "Results",
            tournament.urls.domain + tournament.urls.results
          );

        let tableHeader =
          "Player 1||Player 2|Time^1\n---------:|:--------:|:---------|----------";

        let stringFormatMatches = [];

        if (tournament.rounds.length === 0) {
          reject("No Matches available for today.");
        }

        stringFormatMatches = stringFormatMatches
          .concat(
            tournament.rounds.map(round => {
              return `__${round.RoundName}__ 
              _Best of ${round.Distance * 2 - 1}_ 
              \n\n${tableHeader} \n${round.matches
                .sort((match, next) => {
                  return (
                    match.ScheduledDate.substring(11, 16).replace(":", "") >
                    next.ScheduledDate.substring(11, 16).replace(":", "")
                  );
                })
                .map(match => {
                  return `${playerName(match.player1)}|v|${playerName(
                    match.player2
                  )}|${timeFormat(match.ScheduledDate)}`;
                })
                .join("\n")}\n`;
            })
          )
          .join("\n")
          .concat(lineBreak + info)
          .concat(lineBreak + postScript);

        resolve({
          subredditName: process.env.SUBREDDIT_NAME,
          title: `{Discussion Thread} ${tournament.Name} ${moment().format(
            "DD/MM/YYYY"
          )}`,
          text: stringFormatMatches
        });
      })
      .catch(error => {
        console.error(error);
        reject("Failed to get match data.");
      });
  });
}

function playerName(player) {
  return player.SurnameFirst
    ? `${player.LastName} ${player.FirstName}`
    : `${player.FirstName} ${player.LastName}`;
}

function getRedditFormatLink(text, url) {
  return "[" + text + "](" + url + ")";
}

function timeFormat(inputTime) {
  let time = inputTime.substring(11, 16);

  let getTimeLink = time => {
    return getRedditFormatLink(
      time,
      "http://www.thetimezoneconverter.com/?t=" +
        time +
        "&tz=GMT%20\\(Greenwich%20Mean%20Time\\)"
    );
  };

  return getTimeLink(time);
}

module.exports = {
  getDailyTournamentPostViaApi: getDailyTournamentPostViaApi
};
