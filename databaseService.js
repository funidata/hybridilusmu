
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

/**
 * Changes the default signup for the user to the opposite for the given weekday.
 * @param {string} userId - Slack user id.
 */
const toggleDefaultSignup = async (userId, weekday, signIn, atOffice = true) => {
  if (!signIn) {
    await db.removeDefaultSignup(userId, weekday)
  } else {
    await db.addDefaultSignupForUser(userId, weekday, atOffice)
  }
}

const getDefaultEnrollmentsFor = async (weekday) => {
  const slackIds = await db.getAllOfficeDefaultSignupsForAWeekday(weekday)
  return slackIds
}

/**
 * Returns true, if user is marked as present at the office on the given weekday by default.
 */
const userInOfficeByDefault = async (userId, weekday, atOffice = true) => {
  const enrollment = await db.getOfficeDefaultSignupForUserAndWeekday(userId, weekday)
  return enrollment && enrollment.at_office === atOffice
}

module.exports = {
  getEnrollmentsFor,
  getDefaultEnrollmentsFor,
  toggleSignup,
  toggleDefaultSignup,
  userInOffice,
  userIsRemote,
  userInOfficeByDefault
};
