const PlotsService = {
  getAllPlots(knex) {
    return knex
      .select(
        "plots.id",
        "plots.plotname",
        "plots.plotnotes",
        "crops.cropname",
        "crops.id",
        "crops.dateplanted",
        "crops.dateharvested",
        "crops.cropnotes",
        "users.username"
      )
      .from("plots")
      .leftJoin("crops", "crops.plotid", "plots.id")
      .leftJoin("users", "plots.user_id", "users.id");
  }
};

module.exports = PlotsService;
