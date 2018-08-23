const expect = require('chai').expect;
const matches = require('../../src/matches/matches.controller.js');
const matchesData = require('../../src/matches/matches.data.js');
const matchesMock = require('../../src/matches/matches.mock.js');
const nock = require('nock');


describe('Match data retrieval', () => {
    beforeEach(() => {
        nock(matchesData.source.domain)
            .get(matchesData.source.path)
            .reply(200, matchesMock.raw);
    });

    it('should return a formatted Daily Tournament Post object', async () => {
        var dailyTournamentPost = await matches.getDailyTournamentPost();

        expect(typeof dailyTournamentPost).to.equal('object');
    });
});