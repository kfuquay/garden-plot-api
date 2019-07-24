const PlotsService = {
  getAllPlots(knex) {
    return knex
      .select(
        "plots.id",
        "plots.plotName",
        "plots.plotNotes",
        "crops.cropName",
        "crops.id",
        "crops.datePlanted",
        "crops.dateHarvested",
        "crops.cropNotes",
        "users.username"
      )
      .from("plots")
      .leftJoin("crops", "crops.plotId", "plots.id")
      .leftJoin("users", "plots.user_id", "users.id");
  },
//   insertProject(knex, newProject) {
//     return knex
//       .insert(newProject)
//       .into("projects")
//       .returning("*")
//       .then(([project]) => project);
//   },
//   getById(knex, id) {
//     return knex
//       .select("*")
//       .from("plots")
//       .where("id", id)
//       .first();
//   },
//   deletePlot(knex, id) {
//     return knex("plots")
//       .where({ id })
//       .delete();
//   }
  // updateProject(knex, id, newProjectFields) {
  //   return knex("plots")
  //     .where({ id })
  //     .update(newProjectFields);
  // },
};

module.exports = PlotsService;
