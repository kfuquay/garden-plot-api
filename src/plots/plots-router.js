const logger = require("../logger");
const path = require("path");
const express = require("express");
const xss = require("xss");
const PlotsService = require("./plots-service");
const { requireAuth } = require("../middleware/jwt-auth");

const plotsRouter = express.Router();
const jsonParser = express.json();

const serializePlot = plot => ({
  id: plot.id,
  plotname: xss(plot.plotname),
  plotnotes: xss(plot.plotnotes),
  cropname: xss(plot.cropname),
  dateplanted: plot.dateplanted,
  dateharvested: plot.dateharvested,
  cropnotes: xss(plot.cropnotes),
  username: xss(plot.username)
});

plotsRouter
  .route("/")
  // get all plots, serialize (clean inputs in case of xss attack)
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    PlotsService.getAllPlots(knexInstance)
      .then(plots => {
        res.json(plots.map(serializePlot));
      })
      .catch(next);
  })

  //TODO: write tests for post method
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { plotname, id, plotnotes, crops, user_id, plotid } = req.body;
    const newPlot = { id, plotname, plotnotes, user_id };
    const newCrops = { crops, plotid };

    if (!plotname) {
      return res.status(400).json({
        error: { message: `Missing 'plot name' in request body` }
      });
    }

    ProjectsService.insertProject(req.app.get("db"), newPlot, newCrops)
      .then(plot => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${plot.id}`))
          .json(serializePlot(plot));
      })
      .catch(next);
  });

plotsRouter
  .route("/:plot_id")
  .all((req, res, next) => {
    PlotsService.getById(req.app.get("db"), req.params.plot_id)
      .then(plot => {
        if (!plot) {
          return res.status(404).json({
            error: { message: `Plot does not exist` }
          });
        }
        res.plot = plot;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializePlot(res.plot));
  });
module.exports = plotsRouter;
