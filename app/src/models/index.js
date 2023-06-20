'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

const {
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_HOST,
} = process.env;

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    dialect: 'postgres',
    logging: false,
  },
);

// db.close = () => {
//   db.sequelize.close()
// }

// db.open = () => {
//   db.sequelize = new Sequelize(
//     DATABASE_NAME,
//     DATABASE_USERNAME,
//     DATABASE_PASSWORD,
//     {
//       host: DATABASE_HOST,
//       dialect: 'postgres',
//       logging: false,
//     },
//   );
// }

const disconnect = () => {
  db.sequelize.close()
}

const open = () => {
  db.sequelize = new Sequelize(
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    {
      host: DATABASE_HOST,
      dialect: 'postgres',
      logging: false,
    },
  );
}

// FIXME: This needs to go.
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db, { disconnect, open };
