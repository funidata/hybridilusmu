module.exports = (sequelize, Sequelize) => sequelize.define('Defaultsignup', {
    weekday: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    atOffice: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
}, { timestamps: false });
