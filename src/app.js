require('dotenv').config();

const matches = require('./controllers/matches');
const reddit = require('./reddit');

const http = require('http');

const client = reddit.client;

const streamOpts = {
    subreddit: process.env.SUBREDDIT_NAME,
    results: 25
};

const comments = client.CommentStream(streamOpts);

//Submit post with daily matches for current tournament.
let stringFormatMatches = 'Match|||Time\n---------:|:--------:|:---------|----------\n';

matches.get().then(function(data) {
    data = data.filter((item) => {
        return item.time.includes('today');
    });

    for(let i=0; i<data.length; i++) {
        stringFormatMatches += data[i].player + '|V|' + data[i].opponent + '|' + data[i].time.replace('Est. today', '~') + '\n';
    }

    let currentTime = new Date();

    let postOptions = {
        subredditName: process.env.SUBREDDIT_NAME,
        title: '{Discssion Thread} TOURNAMENT NAME ' + currentTime.getDay() + '/' + currentTime.getMonth() + '/' + currentTime.getFullYear(),
        text: stringFormatMatches
    };

    //comment out to stop posting every time app.js runs.
    //reddit.r.submitSelfpost(postOptions).then(console.log);
});


//Listen for comments and reply.
comments.on('comment', function (comment) {
    console.log(comment);
    if (comment.body.indexOf('billiardbot') !== -1) {
        getCommentReply(comment).then(function(reply){
            comment.reply(reply);
        }).catch(function(error){
            console.log(error);
        });
    }
});

function getData(url) {
    console.log(url);
    return new Promise(function(resolve, reject){
        http.get(url, function (resp) {
            var data = '';

            resp.on('data', function (chunk) {
                data += chunk;
            });

            resp.on('end', function () {
                resolve(JSON.parse(data));
            });

        }).on("error", function (err) {
            reject(JSON.parse(err));
        });
    });
}

function getDateString(string){
    var date = new Date(string);
    date = date.toString().split(':');
    return date[0].substring(0, date[0].length - 2);
}

function getCommentReply(comment){
    return new Promise(function(resolve, reject){
        var keywords = comment.body.split(' ').map(function (keyword) {
            return keyword.trim();
        }).filter(function (keyword) {
            return keyword && keyword !== 'billiardbot';
        });
        console.log(keywords);

        var returnData= {
            name: '',
            date: '',
            eventName: ''
        };

        getData('http://api.snookerorg.ardalen.com/?t=10&s=2017').then(function(response){
            var playerId = response.filter(function(player){
                return keywords.indexOf(player.FirstName) !== -1 && keywords.indexOf(player.LastName) !== -1
            }).map(function(player){
                returnData.name = player.FirstName.trim() + ' '+ player.MiddleName.trim() + ' '+ player.LastName.trim();
                return player.ID;
            })[0];
            return getData('http://api.snookerorg.ardalen.com/?t=8&p=' + playerId + '&s=2017');
        }).then(function(response){
            var eventId = response[0].EventID;
            returnData.date = response[0].ScheduledDate || response[0].InitDate;
            return getData('http://api.snookerorg.ardalen.com/?e=' + eventId);
        }).then(function(response){
            returnData.eventName = response.Name;
        }).then(function(){
            var reply = returnData.name.trim() + ' is playing in the ' + returnData.eventName.trim() + ' on ' + getDateString(returnData.date);
            console.log(returnData);
            console.log(reply);
            resolve(reply);
        }).catch(function(error){
            reject(error);
        });
    });
}
