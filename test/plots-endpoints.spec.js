const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const {
  makePlotsArray,
  makeMaliciousPlot,
  makeUsersArray,
  makeCropsArray,
  expectedPlots
} = require("./test-helpers");
const helpers = require("./test-helpers");

describe(`plots endpoints`, function() {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => helpers.cleanTables(db));

  afterEach("cleanup the table", () => helpers.cleanTables(db));

  describe(`GET /api/plots`, () => {
    context(`Given no plots`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/plots")
          .expect(200, []);
      });
    });

    context("Given there are plots in the database", () => {
      const testUsers = makeUsersArray();
      const testPlots = makePlotsArray();
      const testCrops = makeCropsArray();

      beforeEach("insert plots", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("plots").insert(testPlots);
          })
          .then(() => {
            return db.into("crops").insert(testCrops);
          });
      });

      it("responds with 200 and all of the plots", () => {
        return supertest(app)
          .get("/api/plots")
          .expect(200, expectedPlots);
      });
    });
    context("Given an XSS attack plot", () => {
      const {
        maliciousPlot,
        maliciousCrops,
        expectedPlot
      } = makeMaliciousPlot();

      beforeEach("insert malicious plot", () => {
        return db
          .into("plots")
          .insert([maliciousPlot])
          .then(() => {
            return db.into("crops").insert(maliciousCrops);
          });
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/plots`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].plotname).to.eql(expectedPlot.plotname);
            expect(res.body[0].plotnotes).to.eql(expectedPlot.plotnotes);
          });
      });
    });
  });
});
