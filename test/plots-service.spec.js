const PlotsService = require("../src/plots/plots-service");
const knex = require("knex");
const { makePlotsArray, makeUsersArray } = require("./test-helpers");
const helpers = require("./test-helpers");

describe(`Plots service object`, function() {
  let db;
  const testUsers = makeUsersArray();
  const testPlots = makePlotsArray();

  before(() => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
  });

  //disconnect from the database at the end of all the tests
  after(() => db.destroy());

  //remove all the data from the table before we insert new test data
  before("clean the table", () =>
    db.raw("TRUNCATE plots, users RESTART IDENTITY CASCADE")
  );

  //remove all data after each test
  afterEach("cleanup the table", () =>
    db.raw("TRUNCATE plots, users RESTART IDENTITY CASCADE")
  );
  //context is functionally interchangable with describe, using context is more semantically appropriate here
  context(`Given 'plots' has data`, () => {
    //beforeEach test w/data, insert data (necessary as afterEach is cleaning out data)
    beforeEach("insert plots", () => {
      return db
        .into("users")
        .insert(testUsers)
        .then(() => {
          return db.into("plots").insert(testPlots);
        });
    });

    it(`getAllPlots() resolves all plots from 'plots' table`, () => {
      return PlotsService.getAllPlots(db).then(actual => {
        expect(actual).to.eql(helpers.expectedPlots);
      });
    });
    it(`getById() resolves a plot by id from 'plots' table`, () => {
      const thirdId = 3;
      const thirdTestPlot = testPlots[thirdId - 1];
      return PlotsService.getById(db, thirdId).then(actual => {
        expect(actual).to.eql({
          plotid: thirdId,
          plotname: "Third test plot!",
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
          username: "test"
        });
      });
    });
    it(`deletePlot() removes a plot by id from 'plots' table`, () => {
      const plotId = 2;
      return PlotsService.deletePlot(db, plotId)
        .then(() => PlotsService.getAllPlots(db))
        .then(allPlots => {
          const expected = allPlots.filter(plot => plot.plotid !== plotId);
          expect(allPlots).to.eql(helpers.expectedDeleteResults);
        });
    });
    it(`updatePlot() updates a plot from the 'plots' table`, () => {
      const idOfPlotToUpdate = 3;
      const newPlotData = {
        plotname: "new name",
        plotnotes: "new notes",
        crops: {
          crops: [{ cropname: "new cropname", cropnotes: "new cropnotes" }]
        }
      };
      return PlotsService.updatePlot(db, idOfPlotToUpdate, newPlotData)
        .then(() => PlotsService.getById(db, idOfPlotToUpdate))
        .then(plot => {
          expect(plot).to.eql({
            plotid: idOfPlotToUpdate,
            username: "test",
            ...newPlotData
          });
        });
    });
  });

  context(`Given 'plots' had no data`, () => {
    beforeEach("insert plots", () => {
      return db.into("users").insert(testUsers);
    });

    it(`getAllPlots() resolves an empty array`, () => {
      return PlotsService.getAllPlots(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });
  });
});
