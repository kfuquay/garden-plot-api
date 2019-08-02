const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const {
  makePlotsArray,
  makeMaliciousPlot,
  makeUsersArray,
  expectedPlots,
  expectedDeleteResults
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

      beforeEach("insert plots", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("plots").insert(testPlots);
          });
      });

      it("responds with 200 and all of the plots", () => {
        return supertest(app)
          .get("/api/plots")
          .expect(200, expectedPlots);
      });
    });
    context("Given an XSS attack plot", () => {
      const { maliciousPlot, expectedPlot } = makeMaliciousPlot();

      beforeEach("insert malicious plot", () => {
        return db.into("plots").insert([maliciousPlot]);
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

      beforeEach("insert plots", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("plots").insert(testPlots);
          });
      });

      it("responds with 200 and the specified plot", () => {
        const plotId = 2;
        const expectedPlot = {
          plotid: 2,
          plotname: "Second test plot!",
          plotnotes: "yep",
          crops: {
            crops: [
              {
                cropname: "test cropname",
                cropnotes: "testcropnotes",
                dateplanted: "2019-1-9",
                dateharvested: "2019-2-9"
              },
              {
                cropname: "test cropname",
                cropnotes: "testcropnotes",
                dateplanted: "2019-1-9",
                dateharvested: "2019-2-9"
              },
              {
                cropname: "test cropname",
                cropnotes: "testcropnotes",
                dateplanted: "2019-1-9",
                dateharvested: "2019-2-9"
              }
            ]
          },
          username: "dunder"
        };
        return supertest(app)
          .get(`/api/plots/${plotId}`)
          .expect(200, expectedPlot);
      });
    });
    context(`Given an XSS attack Plot`, () => {
      const { maliciousPlot, expectedPlot } = makeMaliciousPlot();

      beforeEach("insert malicious Plot", () => {
        return db.into("plots").insert([maliciousPlot]);
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/plots/${maliciousPlot.plotid}`)
          .expect(200)
          .expect(res => {
            expect(res.body.plotname).to.eql(expectedPlot.plotname);
            expect(res.body.plotnotes).to.eql(expectedPlot.plotnotes);
          });
      });
    });
  });

  describe(`POST /api/plots`, () => {
    const testUsers = makeUsersArray();

    beforeEach("insert users", () => {
      return db.into("users").insert(testUsers);
    });

    it(`creates a plot, responding with 201 and the new plot`, function() {
      const testPlot = {
        plotname: "test plotname",
        plotnotes: "test plotnotes",
        user_id: 1
      };

      return supertest(app)
        .post("/api/plots")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(testPlot)
        .expect(201)
        .expect(res => {
          expect(res.body.plotname).to.eql(testPlot.plotname);
          expect(res.body.plotnotes).to.eql(testPlot.plotnotes);
          expect(res.body).to.have.property("plotid");
          expect(res.headers.location).to.eql(`/api/plots/${res.body.plotid}`);
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/plots/${postRes.body.plotid}`)
            .expect(postRes => {
              expect(postRes.body.plotname).to.eql(testPlot.plotname);
              expect(postRes.body.plotnotes).to.eql(testPlot.plotnotes);
              expect(postRes.body).to.have.property("plotid");
            })
        );
    });

    it(`responds with 400 and an error message when the 'plot name' is missing`, () => {
      return supertest(app)
        .post("/api/plots")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send({
          plotnotes: "test plotnotes"
        })
        .expect(400, {
          error: { message: `Missing 'plot name' in request body` }
        });
    });

    it("removes XSS attack content from response", () => {
      const { maliciousPlot, expectedPlot } = makeMaliciousPlot();
      return supertest(app)
        .post("/api/plots")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(maliciousPlot)
        .expect(201)
        .expect(res => {
          expect(res.body.plotname).to.eql(expectedPlot.plotname);
          expect(res.body.plotnotes).to.eql(expectedPlot.plotnotes);
        });
    });
  });

  describe(`DELETE /api/plots/:plot_id`, () => {
    context("Given there are plots in the database", () => {
      const testUsers = makeUsersArray();
      const testPlots = makePlotsArray();

      beforeEach("insert plots", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("plots").insert(testPlots);
          });
      });

      it("responds with 204 and removes the plot", () => {
        const testUsers = makeUsersArray();
        const idToRemove = 2;

        return supertest(app)
          .delete(`/api/plots/${idToRemove}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/plots`)
              .expect(expectedDeleteResults)
          );
      });
    });
    context("Given no plots", () => {
      const testUsers = makeUsersArray();

      it("responds with 404", () => {
        const plotId = 98765545;
        return supertest(app)
          .delete(`/api/plots/${plotId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `Plot does not exist` } });
      });
    });
  });
  describe(`PATCH /api/plots/:plot_id`, () => {
    context("Given there are plots in the database", () => {
      const testUsers = makeUsersArray();
      const testPlots = makePlotsArray();

      beforeEach("insert plots", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("plots").insert(testPlots);
          });
      });

      const idToUpdate = 3;
      const newPlotData = {
        plotname: "new plotname",
        plotnotes: "new plotnotes",
        plotid: 3,
        crops: { crops: [{ cropname: "newcropname" }] }
      };

      it("returns the plot with updated values", () => {
        return supertest(app)
          .patch(`/api/plots/${idToUpdate}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newPlotData)
          .expect(200)
          .expect(res => {
            expect(res.body.plotname)
              .to.eql(newPlotData.plotname)
              .expect(res.body.plotnotes)
              .to.eql(newPlotData.plotnotes);
          });
      });
    });
  });
});
