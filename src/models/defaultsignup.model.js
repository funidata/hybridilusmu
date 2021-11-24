module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Defaultsignup', {
        weekday: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        atOffice: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
    });
};
