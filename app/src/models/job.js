"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.ScheduledMessage, {
        foreignKey: "channelId",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Office, { foreignKey: "OfficeId", onDelete: "CASCADE" });
    }
  }
  Job.init(
    {
      channel_id: DataTypes.STRING,
      time: DataTypes.TIME,
      OfficeId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Job",
      indexes: [{ fields: ["channel_id"], unique: true }],
    },
  );
  return Job;
};
