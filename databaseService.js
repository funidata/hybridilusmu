
const db = require('./controllers/db.controllers');

/**
 * Returns a list of Slack ids of people who are at the office on the given day.
 * @param {string} date - Date string in the ISO date format.
 */
const getEnrollmentsFor = async (date) => {
  const slackIds = await db.getAllOfficeSignupsForADate(date)
  return slackIds
}

/**
 * Changes the sign up for the user to the opposite for the given day.
 * @param {string} userId - Slack user id.
 * @param {string} date - Date string in the ISO date format.
 */
const toggleSignup = async (userId, date, signIn, atOffice = true) => {
  if (!signIn) {
    await db.removeSignup(userId, date)
  } else {
    await db.addSignupForUser(userId, date, atOffice)
  }
}

/**
 * Returns true, if user is marked as present at the office on the given day.
 */
const userInOffice = async (userId, date, atOffice = true) => {
  const enrollment = await db.getOfficeSignupForUserAndDate(userId, date)
  return enrollment && enrollment.at_office === atOffice
}

/**
 * Returns true, if user is not marked present at the office on the given day.
 */
const userIsRemote = async (userId, date) => {
  return userInOffice(userId, date, false)
}

module.exports = {
  getEnrollmentsFor,
  toggleSignup,
  userInOffice,
  userIsRemote
};
