const { SocketModeClient } = require('@slack/socket-mode');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_SCHEMA || 'postgres',
                                process.env.DB_USER || 'postgres',
                                process.env.DB_PASSWORD || '',
                                {
                                    host: process.env.DB_HOST || 'localhost',
                                    port: process.env.DB_PORT || '5432',
                                    dialect: 'postgres',
                                    dialectOptions: {
                                        ssl: process.env.DB_SSL == "true"
                                    }
                                });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Person = require("./models/person.model.js")(sequelize, Sequelize);
db.Signup = require("./models/signup.model.js")(sequelize, Sequelize);


db.Person.hasMany(db.Signup, { as: "signups" });

db.Signup.belongsTo(db.Person, {
    foreignKey: "personId",
    as: "person",
});

module.exports = db;