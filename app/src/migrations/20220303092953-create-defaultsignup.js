"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Defaultsignups", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      weekday: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      atOffice: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
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
    await queryInterface.addColumn(
      "Defaultsignups", // name of Source model
      "PersonId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "People", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    );
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Defaultsignups");
  },
};
