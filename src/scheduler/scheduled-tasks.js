module.exports = {
    postDailyUpdateToSubReddit: {
        controller: require('../matches/matches.controller'),
        cron: '0 6 * * *',
        preProcessMessage: 'Running daily job to post update to subreddit',
        execute: function(reddit){
            return new Promise((resolve, reject) => {
                this.controller.getDailyTournamentPost().then((dailyTournamentPost) => {
                    reddit.r.submitSelfpost(dailyTournamentPost).then((response) => {
                        resolve(response);
                    }).catch((err) => {
                        reject(err)
                    });
                }).catch((err) => {
                    console.log(err);
                    reject(err)
                });
            });
            //Post daily tournament/matches to subreddit
        },
        postProcessMessage: 'COMPLETED: Running daily job to post update to subreddit'
    }
};