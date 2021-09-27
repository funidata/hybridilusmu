const { sequelize, Sequelize } = require("../database");

module.exports = ( sequelize, Sequelize ) => {
    const Signups = sequelize.define('Signups', {
        office_date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        at_office: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        }
    });
    return Signups;
};
