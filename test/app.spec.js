const expect = require('chai').expect;
const matches = require('../src/matches')

describe('test', () => {
    it('should return matches as an array', () => {
        matches.get().then((matchData) => {
            expect(matchData).to.be.an('array');
        });
    });
});