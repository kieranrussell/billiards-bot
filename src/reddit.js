const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');

// console.log(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDDIT_USER, process.env.REDDIT_PASS);

const r = new Snoowrap({
    userAgent: 'billiard-bot',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

module.exports = {
  client: new Snoostorm(r)
};