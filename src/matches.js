const rp = require('request-promise');
const cheerio = require('cheerio');

const options = {
    uri: `http://www.snooker.org/res/index.asp?template=24`,
    transform: function (body) {
        return cheerio.load(body);
    }
};

function get(){
    return new Promise(function(resolve, reject){
        rp(options)
            .then(($) => {
                var matches = [];
                $('table#latest > tbody > tr').each((i, item) => {
                    var match = {
                        player: $('td.player:nth-child(3) > a', item).text().trim(),
                        opponent: $('td.player:nth-child(8) > a', item).text().trim(),
                        time: $('td.scheduled', item).text().trim()
                    };
                    matches.push(match);
                });

                return matches;
            }).then((matches) => {
                resolve(matches);
        }).catch((err) => {
            console.log(err);
        });
    })
}

module.exports = get;