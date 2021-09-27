const { sequelize, Sequelize } = require("../database");

module.exports = (sequelize, Sequelize) => {
    const Person = sequelize.define('Person', {
        slack_user_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        real_name: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return Person
};
