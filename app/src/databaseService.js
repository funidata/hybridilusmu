const { DateTime } = require("luxon");
const db = require("./controllers/db.controllers");
const dfunc = require("./dateFunctions");

/**
 * Adds, removes or updates a registration for the given user, office and day.
 * @param {string} userId - Slack user ID.
 * @param {string} officeId - Office ID string.
 * @param {string} date - Date string in the ISO date format.
 * @param {boolean} addRegistration - true, if we want to add a registration and
 * false, if we want to remove one.
 * @param {boolean} atOffice - true, if we want to add an "office" registration and
 * false, if we want to add a "remote" one.
 * This is only taken into account if @addRegistration is true.
 */
const changeRegistration = async (userId, officeId, date, addRegistration, atOffice = true) => {
  if (addRegistration) {
    await db.addRegistrationForUser(userId, officeId, date, atOffice);
  } else {
    await db.removeRegistration(userId, date);
  }
};

/**
 * Adds, removes or updates a default registration for the given user, office and weekday.
 * @param {string} userId - Slack user ID.
 * @param {string} officeId - Office ID string.
 * @param {string} weekday - Weekday as in "Maanantai".
 * @param {boolean} addRegistration - true, if we want to add a registration and
 * false, if we want to remove one.
 * @param {boolean} atOffice - true, if we want to add an "office" registration and
 * false, if we want to add a "remote" one.
 * This is only taken into account if @addRegistration is true.
 */
const changeDefaultRegistration = async (
  userId,
  officeId,
  weekday,
  addRegistration,
  atOffice = true,
) => {
  if (addRegistration) {
    await db.addDefaultRegistrationForUser(userId, officeId, weekday, atOffice);
  } else {
    await db.removeDefaultRegistration(userId, weekday);
  }
};

/**
 * Returns a list of Slack user IDs of people who are at the given office on
 * the given day. If no office argument is given, return user's from all offices.
 * @param {string} date - Date string in the ISO date format.
 * @param {string} [officeId] Optional office id to filter the query.
 */
const getRegistrationsFor = async (date, officeId) => {
  const result = new Set(
    await db.getAllDefaultOfficeRegistrationsForWeekday(
      dfunc.getWeekday(DateTime.fromISO(date)),
      officeId,
    ),
  );
  const registrations = await db.getAllRegistrationsForDate(date);
  registrations.forEach((obj) => {
    if (obj.status === true && (officeId ? obj.officeId === officeId : true)) {
      result.add(obj.slackId);
    } else {
      result.delete(obj.slackId);
    }
  });
  return Array.from(result);
};

const removeJob = async (channelId) => db.removeJob(channelId);

const addAllJobs = async (jobs) => db.addAllJobs(jobs);

/**
 * Updates the jobs in the database by removing channels that the bot
 * is no longer a member of and conversely adds all the channels that the bot
 * is a member of.
 * @param {*} channels - List of channel IDs that the bot is a member of.
 */
const updateJobs = async (channels) => {
  const currentJobs = await getAllJobs();
  // First remove jobs that are no longer found in the list of channels
  for (const job of currentJobs) {
    if (!channels.find((c) => c.channel_id === job.channelId)) {
      removeJob(job.channelId);
    }
  }
  // Add any new channels that are not yet in the database.
  addAllJobs(channels);
};

/**
 * Adds or updates the timing of the daily message for the given channel.
 * @param {string} channelId - Slack channel ID.
 * @param {string} time - Optional. Time string in the ISO date format.
 */
const addJob = async (channelId, time, officeId) => db.addJob(channelId, time, officeId);

const getAllJobs = async () => db.getAllJobs();

/**
 * Returns a list of Slack user IDs of people who are at the given office for every weekday
 * between firstDate and lastDate (inclusive).
 * Returns a dictionary of sets.
 * @param {string} firstDate - Date string in the ISO date format.
 * @param {string} lastDate - Date string in the ISO date format.
 * @param {string} office - Office object.
 * @returns {Dictionary}
 */
const getRegistrationsBetween = async (firstDate, lastDate, office) => {
  const normalRegistrations = await db.getAllRegistrationsForDateInterval(firstDate, lastDate);
  const defaultRegistrations = await db.getAllDefaultOfficeSettings(office);
  const defaultIds = {};
  for (let i = 0; i < 5; i += 1) {
    defaultIds[dfunc.weekdays[i]] = [];
  }
  defaultRegistrations.forEach((entry) => {
    defaultIds[entry.weekday].push(entry.slackId);
  });
  const result = {};
  let date = DateTime.fromISO(firstDate);
  const endDate = DateTime.fromISO(lastDate);
  while (date <= endDate) {
    const isoDate = date.toISODate();
    result[isoDate] = new Set();
    if (dfunc.isWeekday(date)) {
      defaultIds[dfunc.getWeekday(date)].forEach((slackId) => {
        result[isoDate].add(slackId);
      });
    }
    date = date.plus({ days: 1 });
  }
  normalRegistrations.forEach((entry) => {
    if (entry.status && entry.officeId === office.id) {
      result[entry.date].add(entry.slackId);
    } else if (result[entry.date].has(entry.slackId)) {
      result[entry.date].delete(entry.slackId);
    }
  });
  return result;
};

/**
 * Returns a dictionary where key is weekday as in "Maanantai" and the value is a
 * registration object containing the status, officeID, officeName and officeEmoji.
 * Null means there is no setting for that weekday and statutes True means at office,
 * false means remote.
 * @param {string} userId - Slack user ID.
 * @returns {Dictionary}
 */
const getDefaultSettingsForUser = async (userId) => {
  const unorderedSettings = await db.getDefaultSettingsForUser(userId);
  const result = {};
  for (let i = 0; i < 5; i += 1) {
    let found = false;
    unorderedSettings.every((entry) => {
      if (entry.weekday === dfunc.weekdays[i]) {
        result[entry.weekday] = {
          status: entry.status,
          officeId: entry.officeId,
          officeName: entry.officeName,
          officeEmoji: entry.officeEmoji,
        };
        found = true;
        return false;
      }
      return true;
    });
    if (!found) {
      result[dfunc.weekdays[i]] = null;
    }
  }
  return result;
};

/**
 * Returns a dictionary, where keys are ISO Date strings of days starting from @fistDate and ending at @lastDate (inclusive).
 * The values are registration objects containing (status, officeId, officeName, officeEmoji). Null means that there is no registration
 * for that day and status True means at office, False means remote.
 * @param {string} userId - Slack user ID.
 * @param {string} firstDate - Date string in the ISO date format.
 * @param {string} lastDate - Date string in the ISO date format.
 * @returns {Dictionary}
 */
const getRegistrationsForUserBetween = async (userId, firstDate, lastDate) => {
  const userRegs = await db.getRegistrationsForUserForDateInterval(userId, firstDate, lastDate);
  const result = {};
  let date = DateTime.fromISO(firstDate);
  const endDate = DateTime.fromISO(lastDate);
  while (date <= endDate) {
    if (dfunc.isWeekday(date)) {
      result[date.toISODate()] = null;
    }
    date = date.plus({ days: 1 });
  }
  userRegs.forEach((entry) => {
    result[entry.date] = {
      status: entry.status,
      officeId: entry.officeId,
      officeName: entry.officeName,
      officeEmoji: entry.officeEmoji,
    };
  });
  return result;
};

/**
 * Fetches a Slack message id for the given date, channel and optional usergroup
 * @param {string} date Date in the ISO date format.
 * @param {string} channelId Slack channel id
 * @param {string} [usergroupId] optional - Slack usergroup id
 * @returns The message id
 */
const getScheduledMessageId = async (date, channelId, usergroupId = null) => {
  const result = await db.getScheduledMessageId(date, channelId, usergroupId);
  if (result) {
    return result.messageId;
  }
  return null;
};

/**
 * Saves the scheduled messages id to the database.
 * @param {string} messageId Slack message id AKA message timestamp
 * @param {string} date Date in the ISO date format
 * @param {string} channelId Slack channel id
 * @param {string} [usegroupId] optional - Slack usergroup id
 * @returns true if succesful, undefined otherwise
 */
const addScheduledMessage = async (messageId, date, channelId, usergroupId = null) =>
  db.addScheduledMessage(messageId, date, channelId, usergroupId);

/**
 * Adds a new office.
 * @param {string} officeName Name of the office.
 * @param {string} officeEmoji Emoji for the office in format ":emoji:".
 * @returns true if successful, undefined otherwise.
 */
const addOffice = async (officeName, officeEmoji) => db.addOffice(officeName, officeEmoji);

/**
 * Removes an office with the given ID.
 * @param {string} officeId Office id string.
 */
const removeOffice = async (officeId) => db.removeOffice(officeId);

/**
 * Fetches all the offices.
 * @returns An array containing all the Office objects found in the database.
 */
const getAllOffices = async () => db.getAllOffices();

/**
 * Fetches an office with the given id.
 * @param {string} officeId Office id string.
 */
const getOffice = async (officeId) => db.getOffice(officeId);

/**
 * Fetches an office with the given name.
 * @param {string} officeName Name of the office we're finding.
 */
const getOfficeByName = async (officeName) => db.getOfficeByName(officeName);

/**
 * Adds a default office to the user's Person object.
 * @param {string} user Slack user ID.
 * @param {string} officeId Office ID string.
 */
const addDefaultOfficeForUser = async (user, officeId) =>
  db.addDefaultOfficeForUser(user, officeId);

/**
 * Fetches the user's default office.
 * @param {string} user Slack user ID.
 */
const getDefaultOfficeForUser = async (user) => {
  const result = await db.getDefaultOfficeForUser(user);
  if (result) {
    return result;
  }
  // If no default office found for user, default to first office
  console.log("No default office found for user, defaulting to first found office...");
  const offices = await getAllOffices();
  await addDefaultOfficeForUser(user, offices[0].id);
  return offices[0];
};

/**
 * Updates the name and/or emoji of the given office.
 * @param {string} office Office ID string.
 * @param {string} newName New name for the office.
 * @param {string} newEmoji New emoji string for the office.
 */
const updateOffice = async (office, newName, newEmoji) =>
  db.updateOffice(office, newName, newEmoji);

module.exports = {
  changeRegistration,
  changeDefaultRegistration,
  getDefaultSettingsForUser,
  getRegistrationsFor,
  getRegistrationsBetween,
  getRegistrationsForUserBetween,
  removeJob,
  addAllJobs,
  addJob,
  getAllJobs,
  updateJobs,
  getScheduledMessageId,
  addScheduledMessage,
  addOffice,
  removeOffice,
  getDefaultOfficeForUser,
  getAllOffices,
  getOffice,
  getOfficeByName,
  addDefaultOfficeForUser,
  updateOffice,
};
