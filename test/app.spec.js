const expect = require('chai').expect;

describe('test', () => {
    it('should return a string', () => {
        expect('ci with travis').to.equal('ci with travis');
    });

    it('should do simple maths', () => {
        expect(1).to.equal(2-1);
    });

    it('should return matches', () => {
        expect([{match:"finish later"}]).to.not.be.empty;
    });
});