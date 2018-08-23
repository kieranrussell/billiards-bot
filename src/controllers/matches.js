const rp = require('request-promise');
const cheerio = require('cheerio');

const source = {
    domain: 'http://www.snooker.org',
    path: '/res/index.asp?template=24'
};

const options = {
    uri: source.domain + source.path,
    transform: function (body) {
        return cheerio.load(body);
    }
};

function getData() {

}

function get() {
    return new Promise(function (resolve, reject) {
        rp(options)
            .then(($) => {
                var tournament = $('table#latest > thead > tr > th').text().trim();
                var matches = [];
                $('table#latest > tbody > tr').each((i, item) => {
                    var match = {
                        player: $('td.player:nth-child(3) > a', item).text().trim(),
                        opponent: $('td.player:nth-child(8) > a', item).text().trim(),
                        time: $('td.scheduled', item).text().trim()
                    };
                    matches.push(match);
                });

                return {
                    matches: matches,
                    tournament: tournament
                };
            }).then((dailyUpdate) => {
            resolve(dailyUpdate);
        }).catch((err) => {
            reject(err);
        });
    })
}

module.exports = {
    get: get,
    source: source
};