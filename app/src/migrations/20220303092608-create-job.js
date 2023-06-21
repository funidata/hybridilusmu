"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Jobs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      channel_id: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      time: {
        allowNull: true,
        type: Sequelize.TIME,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex("Jobs", {
      fields: ["channel_id"],
      unique: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Jobs");
  },
};
