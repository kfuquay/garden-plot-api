const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeUsersArray, makePlotsArray } = require("./test-helpers");
const helpers = require("./test-helpers");

describe(`crops endpoints`, function() {
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

  describe(`POST /api/plots`, () => {
    const testUsers = makeUsersArray();
    const testPlots = makePlotsArray();

    beforeEach("insert users", () => {
      return db.into("users").insert(testUsers);
    });

    beforeEach("insert plots", () => {
      return db.into("plots").insert(testPlots);
    });

    it(`creates a crop, responding with 201 and the new crop`, function() {
      const testCrop = {
        cropname: "test cropname",
        cropnotes: "test cropnotes",
        dateplanted: "2019-1-9",
        dateharvested: "2019-9-9",
        plotid: 1
      };

      return supertest(app)
        .post("/api/crops")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(testCrop)
        .expect(201)
        .expect(res => {
          expect(res.body.cropname).to.eql(testCrop.cropname);
          expect(res.body.cropnotes).to.eql(testCrop.cropnotes);
          expect(res.body).to.have.property("plotid");
          expect(res.headers.location).to.eql(`/api/crops/${res.body.plotid}`);
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/plots/${postRes.body.plotid}`)
            .expect(postRes => {
              expect(postRes.body.cropname).to.eql(testCrop.cropname);
              expect(postRes.body.cropnotes).to.eql(testCrop.cropnotes);
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
  });
});
