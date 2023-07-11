"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Signups", "OfficeId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Offices",
        key: "id",
      },
    });
    await queryInterface.addColumn("Defaultsignups", "OfficeId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Offices",
        key: "id",
      },
    });
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Signups", "OfficeId");
    await queryInterface.removeColumn("Defaultsignups", "OfficeId");
  },
};
