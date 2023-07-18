"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Jobs", "OfficeId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Offices",
        key: "id",
      },
      onDelete: "CASCADE",
    });
    // Populate all existing jobs with the default office.
    await queryInterface.bulkUpdate("Jobs", { OfficeId: 1 }, {});
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Jobs", "OfficeId");
  },
};
