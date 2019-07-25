const PlotsService = {
  getAllPlots(knex) {
    return knex
      .select(
        "plots.id",
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
      .leftJoin("crops", "crops.plotid", "plots.id")
      .leftJoin("users", "plots.user_id", "users.id");
  },
  getById(knex, id) {
    return knex
      .select(
        "plots.id",
        "plots.plotname",
        "plots.plotnotes",
        "crops.cropname",
        "crops.dateplanted",
        "crops.dateharvested",
        "crops.cropnotes",
        "users.username"
      )
      .from("plots")
      .where("plots.id", id)
      .first()
      .leftJoin("crops", "crops.plotid", "plots.id")
      .leftJoin("users", "plots.user_id", "users.id");
  },
  //TODO: test insert
  insertPlot(knex, newPlot, newCrops) {
    return knex
      .insert(newPlot)
      .into("plots")
      .returning("*")
      .then(([plot]) => plot)
      .then(
        knex
          .insert(newCrops)
          .into("crops")
          .returning("*")
          .then(([crop]) => crop)
      );
  }
};

module.exports = PlotsService;
