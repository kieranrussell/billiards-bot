const matches = require("./matches.data-access");
const moment = require("moment");

//Submit post with daily matches for current tournament.
let lineBreak = "\n\n&nbsp;\n\n";
let postScript = "^(1. Times are in GMT, click for a local time conversion.)";

function getDailyTournamentPostViaApi() {
  return new Promise((resolve, reject) => {
    matches
      .api()
      .then(tournamentData => {
        let info =
          getRedditFormatLink(
            "Live scores",
            tournamentData.urls.domain + tournamentData.urls.liveScores
          ) +
          "\n" +
          getRedditFormatLink(
            "Results",
            tournamentData.urls.domain + tournamentData.urls.results
          );

        let stringFormatMatches = [
          "Round|Player 1||Player 2|Time^1\n----------|---------:|:--------:|:---------|----------"
        ];
        var tournamentName = tournamentData.tournament.Name;
        var todaysData = tournamentData.matches;

        if (todaysData.length === 0) {
          reject("No Matches available for today.");
        }

        stringFormatMatches = stringFormatMatches
          .concat(
            todaysData.map(match => {
              return `${match.Round}|${playerName(
                match.player1
              )}|v|${playerName(match.player2)}|${timeFormatApi(
                match.ScheduledDate
              )}`;
            })
          )
          .join("\n")
          .concat(lineBreak + info)
          .concat(lineBreak + postScript);

        resolve({
          subredditName: process.env.SUBREDDIT_NAME,
          title: `{Discussion Thread} ${tournamentName} ${moment().format(
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

function getDailyTournamentPost() {
  return new Promise((resolve, reject) => {
    matches
      .get()
      .then(tournamentData => {
        let info =
          getRedditFormatLink(
            "Live scores",
            tournamentData.urls.domain + tournamentData.urls.liveScores
          ) +
          "\n" +
          getRedditFormatLink(
            "Results",
            tournamentData.urls.domain + tournamentData.urls.results
          );

        let stringFormatMatches = [
          "Round|Best Of|||Time^1\n----------|----------|---------:|:--------:|:---------|----------"
        ];
        let endBracket = tournamentData.tournament.indexOf(")") + 1;
        var tournamentName = tournamentData.tournament.slice(0, endBracket);
        var todaysData = tournamentData.matches.filter(item => {
          return (
            item.player !== "" &&
            item.opponent !== "" &&
            item.time.toLowerCase().includes("today")
          );
        });

        if (todaysData.length === 0) {
          reject("No Matches available for today.");
        }

        stringFormatMatches = stringFormatMatches
          .concat(
            todaysData.map(match => {
              return `${match.round}|${match.bestOf}|${match.player}|v|${
                match.opponent
              }|${timeFormat(match.time)}`;
            })
          )
          .join("\n")
          .concat(lineBreak + info)
          .concat(lineBreak + postScript.replace("GMT", "CET"));

        let currentTime = new Date();

        resolve({
          subredditName: process.env.SUBREDDIT_NAME,
          title: `{Discussion Thread} ${momemt()}`,
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

function timeFormatApi(inputTime) {
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

function timeFormat(inputTime) {
  let parsedTime = inputTime
    .replace(new RegExp("Est. today", "i"), "")
    .replace(new RegExp("today", "i"), "")
    .replace(new RegExp(" noon", "i"), "pm")
    .replace(new RegExp("today", ""), "&")
    .trim();
  let ampm = parsedTime.slice(-2);
  let time = parsedTime.slice(0, -2);

  let getTimeLink = (time, ampm) => {
    return getRedditFormatLink(
      time + ampm,
      "http://www.thetimezoneconverter.com/?t=" +
        time +
        ampm +
        "&tz=CET%20\\(Central%20European%20Time\\)"
    );
  };

  if (!time.includes(":")) {
    time += ":00";
  }

  return getTimeLink(time, ampm);
}

module.exports = {
  getDailyTournamentPost: getDailyTournamentPost,
  getDailyTournamentPostViaApi: getDailyTournamentPostViaApi
};
