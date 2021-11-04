const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_SCHEMA || 'postgres',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        dialect: 'postgres',
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true',
        },
        logging: false,
    });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Person = require('./models/person.model')(sequelize, Sequelize);
db.Signup = require('./models/signup.model')(sequelize, Sequelize);
db.Defaultsignup = require('./models/defaultsignup.model')(sequelize, Sequelize);

db.Person.hasMany(db.Signup, { as: 'signups' });
db.Person.hasMany(db.Defaultsignup, { as: 'defaultsignups' });

db.Signup.belongsTo(db.Person, {
    foreignKey: 'PersonId',
    as: 'person',
});

db.Defaultsignup.belongsTo(db.Person, {
    foreignKey: 'PersonId',
    as: 'person',
});

module.exports = db;
