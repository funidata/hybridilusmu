"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Offices", "officeEmoji", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // Update the default office to have an emoji
    await queryInterface.bulkUpdate("Offices", { officeEmoji: ":cityscape:" }, { id: 1 });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Offices", "officeEmoji");
  },
};
