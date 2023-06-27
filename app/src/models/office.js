"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Office extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Signup, {
        foreignKey: "OfficeId",
      });
      this.hasMany(models.Defaultsignup, {
        foreignKey: "OfficeId",
      });
    }
  }
  Office.init(
    {
      officeName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Office",
    },
  );
  return Office;
};
