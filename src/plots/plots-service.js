const PlotsService = {
  getAllPlots(knex) {
    return knex
      .select(
        "plots.plotid",
        "plots.plotname",
        "plots.plotnotes",
        "crops.cropname",
        // "crops.id",
        "crops.dateplanted",
        "crops.dateharvested",
        "crops.cropnotes",
        "users.username"
      )
      .from("plots")
      .leftJoin("crops", "crops.plotid", "plots.plotid")
      .leftJoin("users", "plots.user_id", "users.id");
  },
  getById(knex, id) {
    return knex
      .select(
        "plots.plotid",
        "plots.plotname",
        "plots.plotnotes",
        "crops.cropname",
        "crops.dateplanted",
        "crops.dateharvested",
        "crops.cropnotes",
        "users.username"
      )
      .from("plots")
      .where("plots.plotid", id)
      .first()
      .leftJoin("crops", "crops.plotid", "plots.plotid")
      .leftJoin("users", "plots.user_id", "users.id");
  },
  deletePlot(knex, plotid) {
    return knex("plots")
      .where({ plotid })
      .delete();
  },
  //TODO: test insert
  insertPlot(knex, newPlot) {
    return knex
      .insert(newPlot)
      .into("plots")
      .returning("*")
    // .then(([plot]) => {
    //   plot;
    // });
  },
  insertCrops(knex, newCrops) {
    return newCrops.map(crop => {
      knex
        .insert(crop)
        .into("crops")
        .returning("*");
      // .then(([crops]) => crops);
    });
  },
  updatePlot(knex, id, newPlotFields, cropToUpdate) {
    cropToUpdate
      .map((crop, i) => {
        const cropid = crop.cropid;
        const fieldsToUpdate = {
          cropname: crop.cropname,
          cropnotes: crop.cropnotes,
          dateplanted: crop.dateplanted,
          dateharvested: crop.dateharvested
        };
        return knex("plots")
          .where({ cropid })
          .update(fieldsToUpdate);
      })
      .then(() => {
        return (
          knex("plots")
            .where({ id })
            // .leftJoin("crops", "crops.plotid", "plots.id")
            .update(newPlotFields)
        );
      });
  }
};

module.exports = PlotsService;
