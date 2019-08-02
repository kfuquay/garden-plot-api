const PlotsService = {
  //TODO: refactor- would like to return crops as an array of objects
  //TODO: consider completely changing tables - combining crops and plots to one table... where crops would be type json ?  or enum?

  getAllPlots(knex) {
    return knex
      .select(
        "plots.plotid",
        "plots.plotname",
        "plots.plotnotes",
        "plots.crops",
        "users.username"
      )
      .from("plots")
      .leftJoin("users", "plots.user_id", "users.id");
  },
  getById(knex, id) {
    return knex
      .select(
        "plots.plotid",
        "plots.plotname",
        "plots.plotnotes",
        "plots.crops",
        "users.username"
      )
      .from("plots")
      .where("plots.plotid", id)
      .first()
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
  updatePlot(knex, plotid, newPlotFields) {
    return knex("plots")
      .where({ plotid })
      .update(newPlotFields)
      .returning("*");
  }
};

module.exports = PlotsService;
