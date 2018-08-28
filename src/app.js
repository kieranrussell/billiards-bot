require('dotenv').config();
const schedule = require('node-schedule');
const reddit = require('./reddit');
const matchesController = require('./matches/matches.controller');
const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});

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
