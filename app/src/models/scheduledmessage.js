'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScheduledMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Job, {
        foreignKey: 'jobId',
        as: 'job'
      })
    }
  }
  ScheduledMessage.init({
    messageId: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    channelId: DataTypes.STRING,
    usergroupId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ScheduledMessage',
  });
  return ScheduledMessage;
};