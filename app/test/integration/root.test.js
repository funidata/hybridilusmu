const db = require('../../src/models/index');


describe('root suite', function () {
  after(async () => {
    db.sequelize.close()
  })

  require('./databaseService.test')
  require('./db.defaultsignup.test')
  require('./db.person.test.js')
  require('./db.signups.test')
})