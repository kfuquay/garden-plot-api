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
  plotnotes: xss(plot.plotnotes)
});

const serializeCrop = crop => ({
  id: crop.id,
  plotid: crop.plotId,
  cropname: xss(crop.cropName),
  dateplanted: crop.datePlanted,
  dateharvested: crop.dateHarvested,
  cropnotes: xss(crop.cropNotes)
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
  });

module.exports = plotsRouter;
