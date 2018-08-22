const expect = require('chai').expect;
const app = require('../src/app');
const matches = app.matches;

describe('test', () => {
    it('should return matches as an array', () => {
        expect(matches).to.be.an('array');
    });
});