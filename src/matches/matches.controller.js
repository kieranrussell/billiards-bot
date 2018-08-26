const matches = require('./matches.data-access');

//Submit post with daily matches for current tournament.
let stringFormatMatches = ['Match|||Time^1\n---------:|:--------:|:---------|----------'];
let lineBreak = '\n\n&nbsp;\n\n';
let postScript = '^(1. Times are in CEST, click for a local time conversion.)';

function getDailyTournamentPost(){
    return new Promise(function(resolve, reject){
        matches.get().then(function(tournamentData){
            var tournamentName = tournamentData.tournament;
            var todaysData = tournamentData.matches.filter((item) => {
                return item.time.includes('today');
            });

            if(todaysData.length === 0){
                throw "No matches available for today.";
            }

            stringFormatMatches = stringFormatMatches.concat(todaysData.map((match) => {
                return `${match.player}|V|${match.opponent}|${timeFormat(match.time.replace('Est. today', ''))}`
            })).join('\n').concat(lineBreak + postScript);

            let currentTime = new Date();

            resolve({
                subredditName: process.env.SUBREDDIT_NAME,
                title: `{Discssion Thread} ${tournamentName} ${currentTime.getDate()}/${currentTime.getMonth()+1}/${currentTime.getFullYear()}`,
                text: stringFormatMatches
            });
        })
    });
}

function timeFormat(inputTime) {
    let getTimeLink = (time, ampm) => {
        return '(http://www.thetimezoneconverter.com/?t=' + time + ampm + '&tz=CEST%20\\(Central%20European%20Summer%20Time\\)&)'
    };

    let ampm = inputTime.slice(-2);
    let time = inputTime.slice(0, -2);


    if(!time.includes(':')) {
        time += ':00';
    }

    return '[~' + time + ampm + ']' + getTimeLink(time, ampm);
}

module.exports = {
    getDailyTournamentPost: getDailyTournamentPost
};
