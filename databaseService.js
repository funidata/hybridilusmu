
const db = require('./controllers/db.controllers');

const getEnrollmentsFor = async (date) => {
  const slackIds = await db.getAllOfficeSignupsForADate(date)
  return slackIds
}

const toggleSignup = async (userId, date, atOffice = true) => {
  if (await userInOffice(userId, date, atOffice)) {
    await db.removeSignup(userId, date)
  } else {
    await db.addSignupForUser(userId, date, atOffice)
  }
}

const userInOffice = async (userId, date, atOffice = true) => {
  const enrollment = await db.getOfficeSignupForUserAndDate(userId, date)
  return enrollment && enrollment.at_office === atOffice
}

const userIsRemote = async (userId, date) => {
  return userInOffice(userId, date, false)
}

module.exports = {
  getEnrollmentsFor,
  toggleSignup,
  userInOffice,
  userIsRemote
};
