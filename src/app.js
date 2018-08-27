require('dotenv').config();
const schedule = require('node-schedule');
const reddit = require('./reddit');
const client = reddit.client;
const http = require('http');
const matchesController = require('./matches/matches.controller');

schedule.scheduleJob('* 6 * * *', () => {
    console.log('Running daily job to post update to subreddit');
    postDailyUpdateToSubReddit(matchesController);
});

function postDailyUpdateToSubReddit(matchesController){
    //Post daily tournament/matches to subreddit
    matchesController.getDailyTournamentPost().then((dailyTournamentPost) => {
        reddit.r.submitSelfpost(dailyTournamentPost).then(console.log).catch(console.error);
    }).catch((error) => {
        console.log(error);
    });
}
