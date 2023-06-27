"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Person extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Signup, { as: "signup" });
      this.hasMany(models.Defaultsignup, { as: "defaultsignup" });
      this.belongsTo(models.Office, {
        foreignKey: "DefaultOffice",
      });
    }
  }
  Person.init(
    {
      slackId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Person",
    },
  );
  return Person;
};
