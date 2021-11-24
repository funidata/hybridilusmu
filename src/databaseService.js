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
        await db.addRegistrationForUser(userId, date, atOffice);
    } else {
        await db.removeRegistration(userId, date);
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
        await db.addDefaultRegistrationForUser(userId, weekday, atOffice);
    } else {
        await db.removeDefaultRegistration(userId, weekday);
    }
};

/**
 * Returns a list of Slack user IDs of people who are at the office on the given day.
 * @param {string} date - Date string in the ISO date format.
 */
const getRegistrationsFor = async (date) => {
    const defaultOfficeIds = await db.getAllDefaultRegistrationsForWeekday(
        dfunc.getWeekday(DateTime.fromISO(date)),
    );
    const officeIds = new Set(await db.getAllRegistrationsForDate(date));
    const remoteIds = new Set(await db.getAllRegistrationsForDate(date, false));
    defaultOfficeIds.forEach((id) => {
        if (!remoteIds.has(id)) officeIds.add(id);
    });
    return Array.from(officeIds);
};

/**
 * Returns a list of Slack user IDs of people who are at the office for every weekday
 * between firstDate and lastDate (inclusive).
 * Returns an array of arrays.
 * @param {string} firstDate - Date string in the ISO date format.
 * @param {string} lastDate - Date string in the ISO date format.
 * @returns {Array}
 */
const getRegistrationsBetween = async (firstDate, lastDate) => {
    // Toteutetaan tänne.
    // KESKEN!
};

/**
 * Returns a list of values (true, false, undefined) for everyweek day,
 * representing given users default registration settings.
 * List is ordered from Monday to Friday and contains the following information for every day:
 * - weekday: Name of the weekday as in "Maanantai".
 * - status: (true, false, none)
 *      True means office, false remote and none that there is no setting for that weekday.
 * @param {string} userId - Slack user ID.
 * @param {string} firstDate - Date string in the ISO date format.
 * @param {string} lastDate - Date string in the ISO date format.
 * @returns {Array}
 */
const getDefaultSettingsForUser = async (userId) => {
    // Toteutetaan tänne.
    const unorderedSettings = await db.getDefaultSettingsForUser(userId);
    // KESKEN!
};

/**
 * Returns a array of objects, representing the users registration status for that day.
 * List is sorted from firstDate to lastDate and for everyday the object contains the following information:
 * - status : (default, normal or none)
 *      Shows the type of registration to be shown for this day, none if neither default nor normal registration is present.
 * - value: (true, false)
 *      If status is default or normal, value will be set. True means office and false remote.
 * @param {string} userId - Slack user ID.
 * @param {string} firstDate - Date string in the ISO date format.
 * @param {string} lastDate - Date string in the ISO date format.
 * @returns {Array}
 */
const getRegistrationsForUserBetween = async (userId, firstDate, lastDate) => {
    // Toteutetaan tänne.
    // 1. Hae normaalit ilmoittautumiset väliltä (firstDate -> lastDate) (tee tätä varten oma funktio).
    // 2. Hae käyttäjän oletusasetukset funktiolla getDefaultSettingsForUser.
    // 3. Käy läpi normaalit ilmoittautumiset ja jos jollekin päivälle ei ole, lisää oletusilmoittautuminen ja
    // jos ei ole, lisää merkitse statukseksi none.
    // 4. Palauta näin muodostettu lista.
    // KESKEN!
};

/**
 * Returns true, if user's registration for the given day is the same as @atOffice.
 * @param {string} userId - Slack user ID.
 * @param {string} date - Date string in the ISO date format.
 * @param {boolean} atOffice - True, if we want to ask whether the user is registered
 * present at the office. False otherwise.
 */
const userAtOffice = async (userId, date, atOffice = true) => {
    const registration = await db.getUsersRegistrationForDate(userId, date);
    if (registration === undefined) return false;
    return registration.atOffice === atOffice;
};

/**
 * Returns true, if user's default registration for the given day is the same as @atOffice.
 * @param {string} userId - Slack user ID.
 * @param {string} weekday - Weekday as in "Maanantai".
 * @param {boolean} atOffice - True, if we want to ask whether the user is registered
 * present at the office by default. False otherwise.
 */
const userAtOfficeByDefault = async (userId, weekday, atOffice = true) => {
    const registration = await db.getUsersDefaultRegistrationForWeekday(userId, weekday);
    if (registration === undefined) return false;
    return registration.atOffice === atOffice;
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
    getDefaultSettingsForUser,
    getRegistrationsFor,
    userAtOffice,
    userAtOfficeByDefault,
    userIsRemote,
    userIsRemoteByDefault,
};
