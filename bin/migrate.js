require('dotenv').config();
var db = require('../database.js');
db.sequelize.sync({force:true});
