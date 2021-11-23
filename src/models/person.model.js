module.exports = (sequelize, Sequelize) => {
    const Person = sequelize.define('Person', {
        slack_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                // Enforce Slack id uniqueness and speed up queries made by Slack user ID.
                fields: ['slack_id'],
                unique: true,
            },
        ],
    },  {
        timestamps: false
    });
    return Person;
};
