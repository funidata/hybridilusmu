'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Signup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Person, {
        foreignKey: 'PersonId',
        as: 'person'
      });
    }
  }
  Signup.init({
    officeDate: DataTypes.DATEONLY,
    atOffice: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Signup',
    indexes: [{ fields: ['officeDate'] }]
  });
  return Signup;
};
