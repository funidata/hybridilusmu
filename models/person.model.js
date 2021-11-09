module.exports = (sequelize, Sequelize) => {
    const Person = sequelize.define('Person', {
        slack_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        real_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    }, {
        indexes: [
            {
                // enforce slack id uniqueness
                fields: ['slack_id'],
                unique: true,
            },
        ],
    });
    return Person;
};
