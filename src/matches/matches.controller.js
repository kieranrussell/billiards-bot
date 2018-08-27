const matches = require('./matches.data-access');

//Submit post with daily matches for current tournament.
let stringFormatMatches = ['Match|||Time^1\n---------:|:--------:|:---------|----------'];
let lineBreak = '\n\n&nbsp;\n\n';
let postScript = '^(1. Times are in CEST, click for a local time conversion.)';

function getDailyTournamentPost() {
    return new Promise((resolve, reject) => {
        matches.get().then((tournamentData) => {
            let endBracket = tournamentData.tournament.indexOf(')') + 1;
            var tournamentName = tournamentData.tournament.slice(0, endBracket);            
            var todaysData = tournamentData.matches.filter((item) => {
                return item.time.toLowerCase().includes('today');
            });

            if(todaysData.length === 0) {              
                reject("No Matches available for today.");
            }

            stringFormatMatches = stringFormatMatches.concat(todaysData.map((match) => {
                return `${match.player}|V|${match.opponent}|${timeFormat(match.time)}`
            })).join('\n').concat(lineBreak + postScript);

            let currentTime = new Date();         

            resolve({
                subredditName: process.env.SUBREDDIT_NAME,
                title: `{Discssion Thread} ${tournamentName} ${currentTime.getDate()}/${currentTime.getMonth()+1}/${currentTime.getFullYear()}`,
                text: stringFormatMatches
            });
        }).catch((error) => {
            console.log(error);
            reject("Failed to get match data.");
        });
    });
}



function timeFormat(inputTime) {
    let parsedTime = inputTime.replace(new RegExp('Est. today', 'i'), '').replace(new RegExp('today', 'i'), '').replace(new RegExp(' noon', 'i'), 'pm').trim();
    let ampm = parsedTime.slice(-2);
    let time = parsedTime.slice(0, -2);

    let getTimeLink = (time, ampm) => {
        return '(http://www.thetimezoneconverter.com/?t=' + time + ampm + '&tz=CEST%20\\(Central%20European%20Summer%20Time\\))';
    };

    if(!time.includes(':')) {
        time += ':00';
    }

    return '[' + time + ampm + ']' + getTimeLink(time, ampm);
}

module.exports = {
    getDailyTournamentPost: getDailyTournamentPost
};
