module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Person', {
        slackId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                // Enforce Slack user ID uniqueness and speed up queries made by Slack user ID.
                fields: ['slackId'],
                unique: true,
            },
        ],
    });
};
