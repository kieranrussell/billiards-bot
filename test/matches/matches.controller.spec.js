const expect = require('chai').expect;
const matches = require('../../src/matches/matches.controller.js');
const matchesData = require('../../src/matches/matches.data-access.js');
const matchesMock = require('../../src/matches/matches.mock.js');
const nock = require('nock');


describe('Match data transformation into post', () => {
    beforeEach(() => {
        nock(matchesData.source.domain)
            .get(matchesData.source.path)
            .reply(200, matchesMock.raw);
    });

    it('should return a daily tournament post object', async () => {
        var dailyTournamentPost = await matches.getDailyTournamentPost();

        expect(dailyTournamentPost.title).to.include(matchesMock.dailyMessage.title);
        expect(dailyTournamentPost.text).to.equal(matchesMock.dailyMessage.text);
    });
});