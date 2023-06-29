"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Offices", [
      {
        id: 1,
        officeName: "Default Office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkUpdate("Signups", { OfficeId: 1 }, {});

    await queryInterface.bulkUpdate("Defaultsignups", { OfficeId: 1 }, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate("Signups", { OfficeId: null }, {});

    await queryInterface.bulkUpdate("Defaultsignups", { OfficeId: null }, {});
    await queryInterface.bulkDelete("Offices", {
      officeName: "Default Office",
    });
  },
};
