const { sequelize, Sequelize } = require('../database');

module.exports = (sequelize, Sequelize) => {
  const Signups = sequelize.define('Signups', {
    office_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    at_office: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
  }, {
    indexes: [
      {
        // just for speeding up date lookups
        fields: ['office_date'],
      },
      {
        // a two-field index to ensure uniqueness of signups
        fields: ['office_date', 'PersonId'],
        unique: true,
      },
    ],
  });
  return Signups;
};
