const expect = require('chai').expect;
const app = require('../src/app');

describe('test', () => {
    it('should return a string', () => {
        expect('ci with travis').to.equal('ci with travis');
    });

    it('should do simple maths', () => {
        expect(1).to.equal(2-1);
    });

    it('should return matches as an array', () => {
        console.log(app);
        expect(app).to.not.be.empty;
    });
});