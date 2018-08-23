const expect = require('chai').expect;
const matches = require('../../src/matches/matches.data.js');
const matchesMock = require('../../src/matches/matches.mock.js');
const nock = require('nock');


describe('Match data retrieval', () => {
    beforeEach(() => {
        nock(matches.source.domain)
            .get(matches.source.path)
            .reply(200, matchesMock.raw);
    });

    it('should return matches as an object', async () => {
        var matchData = await matches.get();

        expect(typeof matchData).to.equal('object');
    });

    it('should return a tournament name as a string', async () => {
        var matchData = await matches.get();

        expect(matchData.tournament).to.equal('Paul Hunter Classic (22-26 Aug 2018)');
    });

    it('should return a list of matches as an array', async () => {
        var matchData = await matches.get();
        expect(matchData.matches).to.be.an('array');
    });

    it('should return a list of matches as an array with populated values', async () => {
        var matchData = await matches.get();
        expect(JSON.stringify(matchData.matches)).to.equal('[{"player":"Luca Brecel","opponent":"Curtis Daher","time":"Est. Fri 24 Aug 2pm"}]');
    });
});