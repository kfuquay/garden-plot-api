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
  insertPlot(knex, newPlot) {
    return knex
      .insert(newPlot)
      .into("plots")
      .returning("*");
    // .then(([plot]) => {
    //   plot;
    // });
  },
  insertCrop(knex, newCrop) {
    return knex
      .insert(newCrop)
      .into("crops")
      .returning("*");
  },
  updatePlot(knex, plotid, newPlotFields) {
    return knex("plots")
      .where({ plotid })
      .update(newPlotFields);
  }
};

module.exports = PlotsService;
