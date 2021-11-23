module.exports = (sequelize, Sequelize) => {
    const Person = sequelize.define('Person', {
        slack_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                // Enforce Slack id uniqueness.
                fields: ['slack_id'],
                unique: true,
            },
        ],
    });
    return Person;
};
