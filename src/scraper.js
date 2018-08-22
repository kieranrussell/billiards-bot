const rp = require('request-promise');
const cheerio = require('cheerio');

const options = {
    uri: `http://www.snooker.org/res/index.asp?template=24`,
    transform: function (body) {
        return cheerio.load(body);
    }
};

function getGames(){
    return new Promise(function(resolve, reject){
        rp(options)
            .then(($) => {
                var games = [];
                $('table#latest > tbody > tr').each((i, item) => {
                    var game = {
                        player: $('td.player:nth-child(3) > a', item).text().trim(),
                        opponent: $('td.player:nth-child(8) > a', item).text().trim(),
                        time: $('td.scheduled', item).text().trim()
                    };
                    games.push(game);
                });

                return games;
            }).then((games) => {
            resolve(games);
        }).catch((err) => {
            console.log(err);
        });
    })
}