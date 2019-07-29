const path = require("path");
const express = require("express");
const xss = require("xss");
const PlotsService = require("../plots-service");
const { requireAuth } = require("../../middleware/jwt-auth");

const cropsRouter = express.Router();
const jsonParser = express.json();

const serializeCrops = crop => ({
  cropid: crop.cropid,
  cropname: xss(crop.cropname),
  cropnotes: xss(crop.cropnotes),
  dateharvested: crop.dateharvested,
  dateplanted: crop.dateplanted
});

cropsRouter.route("/").post(requireAuth, jsonParser, (req, res, next) => {
  const { cropname, cropnotes, dateharvested, dateplanted, plotid } = req.body;
  const newCrop = { cropname, cropnotes, dateharvested, dateplanted, plotid };

  if (!cropname) {
    return res.status(400).json({
      error: { message: `Missing 'crop name' in request body` }
    });
  }

  PlotsService.insertCrop(req.app.get("db"), newCrop)
    .then(crop => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${crop[0].plotid}`))
        .json(crop[0]);
    })
    .catch(next);
});

module.exports = cropsRouter;
