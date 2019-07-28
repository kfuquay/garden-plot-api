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
  cropname: xss(plot.cropname),
  dateplanted: plot.dateplanted,
  dateharvested: plot.dateharvested,
  cropnotes: xss(plot.cropnotes),
  username: xss(plot.username)
});

const serializeCrops = crop => ({
  cropid: crop.cropid,
  cropname: xss(crop.cropname),
  cropnotes: xss(crop.cropnotes),
  dateharvested: crop.dateharvested,
  dateplanted: crop.dateplanted
});

const serializePlotOnly = plot => ({
  plotid: plot.plotid,
  plotname: xss(plot.plotname),
  plotnotes: xss(plot.plotnotes),
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
      // .then(crops => {
      //   res.json(crops.map(serializeCrop));
      // })
      .catch(next);
  })

  //TODO: test this
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { plotname, plotid, plotnotes, user_id, crops } = req.body;

    const newPlot = { plotid, plotname, plotnotes, user_id };
    const newCrops = [crops];

    if (!plotname) {
      return res.status(400).json({
        error: { message: `Missing 'plot name' in request body` }
      });
    }

    //TODO: debug - insertPlot.then is not a function

    PlotsService.insertCrops(req.app.get("db"), newCrops);
    PlotsService.insertPlot(req.app.get("db"), newPlot)
      .then(plot => {
        console.log(plot[0])
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${plot[0].plotid}`))
          .json(plot[0]);
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
  })
  .delete(requireAuth, (req, res, next) => {
    PlotsService.deletePlot(req.app.get("db"), req.params.plot_id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { plotname, plotnotes, plotid, crops } = req.body;
    // const cropname = req.body.crops.cropname;
    // const cropnotes = req.body.crops.cropnotes;
    // const dateharvested = req.body.crops.dateharvested;
    // const dateplanted = req.body.crops.dateplanted;
    // const cropid = req.body.crops.cropid,
    // crops.map(crop => {
    //   return
    // })
    //TODO: group crops by id, update where id matches?
    const plotToUpdate = {
      plotname,
      plotnotes,
      plotid
      // cropid,
      // cropname,
      // cropnotes,
      // dateplanted,
      // dateharvested
    };
    const cropToUpdate = {
      crops
    };

    const numberOfValues = Object.values(plotToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body is missing required fields`
        }
      });

    PlotsService.updatePlot(
      req.app.get("db"),
      req.params.plot_id,
      serializePlot(plotToUpdate),
      serializeCrops(cropToUpdate)
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = plotsRouter;
