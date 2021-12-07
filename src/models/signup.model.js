module.exports = (sequelize, Sequelize) => sequelize.define('Signup', {
    officeDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    atOffice: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
}, {
    indexes: [{ fields: ['officeDate'] }],
    timestamps: false,
});
