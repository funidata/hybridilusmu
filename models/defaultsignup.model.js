module.exports = (sequelize, Sequelize) => {
    const Defaultsignup = sequelize.define('Defaultsignup', {
        weekday: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        at_office: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                // a two-field index to ensure uniqueness of signups
                fields: ['weekday', 'PersonId'],
                unique: true,
            },
        ],
    });
    return Defaultsignup;
};
