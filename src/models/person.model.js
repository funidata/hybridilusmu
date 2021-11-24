module.exports = (sequelize, Sequelize) => sequelize.define('Person', {
    slackId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, { timestamps: false });
