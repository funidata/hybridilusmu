const { DateTime } = require('luxon');
const db = require('./controllers/db.controllers');
const dfunc = require('./dateFunctions');

/**
 * Adds, removes or updates a registration for the given user, for the given day.
 * @param {string} userId - Slack user ID.
 * @param {string} date - Date string in the ISO date format.
 * @param {boolean} addRegistration - true, if we want to add a registration and
 * false, if we want to remove one.
 * @param {boolean} atOffice - true, if we want to add an "office" registration and
 * false, if we want to add a "remote" one.
 * This is only taken into account if @addRegistration is true.
 */
const changeRegistration = async (userId, date, addRegistration, atOffice = true) => {
    if (addRegistration) {
        await db.addSignupForUser(userId, date, atOffice);
    } else {
        await db.removeSignup(userId, date);
    }
};

/**
 * Adds, removes or updates a default registration for the given user, for the given weekday.
 * @param {string} userId - Slack user ID.
 * @param {string} weekday - Weekday as in "Maanantai".
 * @param {boolean} addRegistration - true, if we want to add a registration and
 * false, if we want to remove one.
 * @param {boolean} atOffice - true, if we want to add an "office" registration and
 * false, if we want to add a "remote" one.
 * This is only taken into account if @addRegistration is true.
 */
const changeDefaultRegistration = async (userId, weekday, addRegistration, atOffice = true) => {
    if (addRegistration) {
        await db.addDefaultSignupForUser(userId, weekday, atOffice);
    } else {
        await db.removeDefaultSignup(userId, weekday);
    }
};

/**
 * Returns a list of Slack user IDs of people who are at the office on the given day.
 * @param {string} date - Date string in the ISO date format.
 */
const getRegistrationsFor = async (date) => {
    const defaultOfficeIds = await db.getAllOfficeDefaultSignupsForAWeekday(
        dfunc.getWeekday(DateTime.fromISO(date)),
    );
    const officeIds = new Set(await db.getAllOfficeSignupsForADate(date));
    const remoteIds = new Set(await db.getAllOfficeSignupsForADate(date, false));
    defaultOfficeIds.forEach((id) => {
        if (!remoteIds.has(id)) officeIds.add(id);
    });
    return Array.from(officeIds);
};

const removeJob = async (channelId) => db.removeJob(channelId);

const addAllJobs = async (jobs) => db.addAllJobs(jobs);

/**
 * Adds or updates the timing of the daily message for the given channel.
 * @param {string} channelId - Slack channel ID.
 * @param {string} time - Optional. Time string in the ISO date format.
 */
const addJob = async (channelId, time) => db.addJob(channelId, time);

const getAllJobs = async () => db.getAllJobs();

/**
 * Returns true, if user's registration for the given day is the same as @atOffice.
 * @param {string} userId - Slack user ID.
 * @param {string} date - Date string in the ISO date format.
 * @param {boolean} atOffice - True, if we want to ask whether the user is registered
 * present at the office. False otherwise.
 */
const userAtOffice = async (userId, date, atOffice = true) => {
    const registration = await db.getOfficeSignupForUserAndDate(userId, date);
    return registration && registration.at_office === atOffice;
};

/**
 * Returns true, if user's default registration for the given day is the same as @atOffice.
 * @param {string} userId - Slack user ID.
 * @param {string} weekday - Weekday as in "Maanantai".
 * @param {boolean} atOffice - True, if we want to ask whether the user is registered
 * present at the office by default. False otherwise.
 */
const userAtOfficeByDefault = async (userId, weekday, atOffice = true) => {
    const registration = await db.getOfficeDefaultSignupForUserAndWeekday(userId, weekday);
    return registration && registration.at_office === atOffice;
};

/**
 * Returns true, if user is not marked as present at the office on the given day.
 * @param {string} userId - Slack user ID.
 * @param {string} date - Date string in the ISO date format.
 */
const userIsRemote = async (userId, date) => userAtOffice(userId, date, false);

/**
 * Returns true, if user is not marked present at the office on the given weekday by default.
 * @param {string} userId - Slack user ID.
 * @param {string} weekday - Weekday as in "Maanantai".
 */
const userIsRemoteByDefault = async (userId, weekday) => (
    userAtOfficeByDefault(userId, weekday, false)
);

module.exports = {
    changeRegistration,
    changeDefaultRegistration,
    getRegistrationsFor,
    removeJob,
    addAllJobs,
    addJob,
    getAllJobs,
    userAtOffice,
    userAtOfficeByDefault,
    userIsRemote,
    userIsRemoteByDefault,
};
