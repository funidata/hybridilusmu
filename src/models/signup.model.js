module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Signup', {
        officeDate: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        atOffice: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                // For speeding up date lookups.
                fields: ['officeDate'],
            },
        ],
    });
};
