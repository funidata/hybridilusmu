module.exports = (sequelize, Sequelize) => {
    const Signup = sequelize.define('Signups', {
        office_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        at_office: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                // For speeding up date lookups.
                fields: ['office_date'],
            },
        ],
    });
    return Signup;
};
