const expect = require("chai").expect;
const matches = require("../../src/matches/matches.data-access.js");
const matchesMock = require("../../src/matches/matches.mock.js");
const nock = require("nock");

const path = "/res/index.asp?template=24&numperpage=100";

describe("Match data retrieval", () => {
  beforeEach(() => {
    nock(matches.source.domain)
      .get(path)
      .reply(200, matchesMock.raw)
      .get(/.*/)
      .reply(200, path);
  });

  it("should return matches as an object", async () => {
    var matchData = await matches.get();

    console.log("logger", matchData);

    expect(typeof matchData).to.equal("object");
  });

  it("should return a tournament name as a string", async () => {
    var matchData = await matches.get();

    console.log("logger", matchData);

    expect(matchData.tournament).to.equal(
      "Paul Hunter Classic (22-26 Aug 2018)"
    );
  });

  it("should return a list of matches as an array", async () => {
    var matchData = await matches.get();

    console.log("logger", matchData);

    expect(matchData.matches).to.be.an("array");
  });

  it("should return a list of matches as an array with populated values", async () => {
    var matchData = await matches.get();

    console.log("logger", matchData);

    expect(matchData.matches[0].player).to.equal("Luca Brecel");
    expect(matchData.matches[0].opponent).to.equal("Curtis Daher");
    expect(matchData.matches[0].time).to.equal("Est. today 5pm");
  });
});
