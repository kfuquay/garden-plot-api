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
  describe(`GET /api/plots/:plot_id`, () => {
    context("Given no plots", () => {
      it("responds with 404", () => {
        const plotId = 123455;
        return supertest(app)
          .get(`/api/plots/${plotId}`)
          .expect(404, { error: { message: `Plot does not exist` } });
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

      it("responds with 200 and the specified plot", () => {
        const plotId = 2;
        const expectedPlot =   {
          id: 2,
          plotname: "Second test plot!",
          plotnotes: "yep",
          cropname: "corn",
          dateplanted: "2018-01-09T00:00:00.000Z",
          dateharvested: "2018-02-09T00:00:00.000Z",
          cropnotes: "lorem",
          username: "dunder"
        }
        return supertest(app)
          .get(`/api/plots/${plotId}`)
          .expect(200, expectedPlot);
      });
    });
  });
});
