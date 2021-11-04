require('dotenv').config();
const db = require('../database.js');

db.sequelize.sync({ force: true });
