require('dotenv').config();
const db = require('../app_files/database');

db.sequelize.sync({ force: true });
