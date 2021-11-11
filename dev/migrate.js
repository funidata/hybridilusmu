require('dotenv').config();
const db = require('../src/database');

db.sequelize.sync({ force: true });
