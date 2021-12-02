module.exports = (sequelize, Sequelize) => {
    const Job = sequelize.define('Job', {
        channel_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        time: {
            type: Sequelize.TIME,
            allowNull: true,
        },
    }, {
        indexes: [
            {
                // enforce channel id uniqueness
                fields: ['channel_id'],
                unique: true,
            },
        ],
    });
    return Job;
};
