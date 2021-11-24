module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Person', {
        slackId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }, { timestamps: false });
};
