const logger = require("../logger");
const path = require("path");
const express = require("express");
const xss = require("xss");
const PlotsService = require("./plots-service");
const { requireAuth } = require("../middleware/jwt-auth");

const plotsRouter = express.Router();
const jsonParser = express.json();

const serializePlot = plot => ({
  plotid: plot.plotid,
  plotname: xss(plot.plotname),
  plotnotes: xss(plot.plotnotes),
  crops: plot.crops,
  username: xss(plot.username)
});

const serializePlotTable = plot => ({
  plotid: plot.plotid,
  plotname: xss(plot.plotname),
  plotnotes: xss(plot.plotnotes),
  crops: plot.crops,
  user_id: plot.user_id
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

  .post(requireAuth, jsonParser, (req, res, next) => {
    const { plotname, plotnotes, crops, user_id } = req.body;
    const newPlot = { plotname, plotnotes, crops, user_id };

    if (!plotname) {
      return res.status(400).json({
        error: { message: `Missing 'plot name' in request body` }
      });
    }

    PlotsService.insertPlot(req.app.get("db"), serializePlotTable(newPlot))
      .then(plot => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${plot[0].plotid}`))
          .json(plot[0]);
      })
      .catch(next);
  });

plotsRouter
  .route("/:plotid")
  .all((req, res, next) => {
    PlotsService.getById(req.app.get("db"), req.params.plotid)
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
  })
  .delete(requireAuth, (req, res, next) => {
    PlotsService.deletePlot(req.app.get("db"), req.params.plotid)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { plotname, plotnotes, plotid, crops, user_id } = req.body;
    const plotToUpdate = { plotname, plotnotes, plotid, crops, user_id };

    const numberOfValues = Object.values(plotToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body is missing required fields`
        }
      });

    PlotsService.updatePlot(
      req.app.get("db"),
      plotToUpdate.plotid,
      serializePlotTable(plotToUpdate)
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = plotsRouter;
