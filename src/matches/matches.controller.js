const matches = require('./matches.data-access');

//Submit post with daily matches for current tournament.
let stringFormatMatches = ['|Match||Time\n---------:|:--------:|:---------|----------'];

function getDailyTournamentPost(){
    return new Promise(function(resolve, reject){
        matches.get().then(function(tournamentData){
            var tournamentName = tournamentData.tournament;
            var todaysData = tournamentData.matches.filter((item) => {
                return item.time.includes('today');
            });

            if(todaysData.length === 0){
                var data = new Date();
                todaysData = tournamentData.matches.filter((item) => {
                    return item.time.includes(data.getDate() + 1);
                });
            }

            stringFormatMatches = stringFormatMatches.concat(todaysData.map((match) => {
                return `${match.player}|V|${match.opponent}|${match.time.replace('Est. today', '~')}`
            })).join('\n');

            let currentTime = new Date();

            resolve({
                subredditName: process.env.SUBREDDIT_NAME,
                title: `{Discssion Thread} ${tournamentName} ${currentTime.getDay()}/${currentTime.getMonth()}/${currentTime.getFullYear()}`,
                text: stringFormatMatches
            });
        })
    });
}

module.exports = {
    getDailyTournamentPost: getDailyTournamentPost
};
