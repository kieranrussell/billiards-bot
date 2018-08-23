const expect = require('chai').expect;
const matches = require('../src/matches');

describe('test', () => {
    it('should return matches as an array', () => {
        expect(matches.get()).to.be.an('array');
    });
});