"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Defaultsignup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Person, {
        foreignKey: "PersonId",
        as: "person",
      });
      this.belongsTo(models.Office, {
        foreignKey: "OfficeId",
      });
    }
  }
  Defaultsignup.init(
    {
      weekday: DataTypes.STRING,
      atOffice: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Defaultsignup",
    },
  );
  return Defaultsignup;
};
