module.exports = (sequelize, Sequelize) => {
    const Job = sequelize.define('Job', {
        channel_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        time: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    }, {
        indexes: [
            {
                // enforce slack id uniqueness
                fields: ['channel_id'],
                unique: true,
            },
        ],
    });
    return Job;
};
