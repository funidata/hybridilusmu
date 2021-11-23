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
    },  {
        timestamps: false
    });
    return Defaultsignup;
};
