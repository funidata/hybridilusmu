const { DateTime } = require("luxon");
const db = require("./controllers/db.controllers");
const dfunc = require("./dateFunctions");

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
const changeRegistration = async (userId, officeId, date, addRegistration, atOffice = true) => {
  if (addRegistration) {
    await db.addRegistrationForUser(userId, officeId, date, atOffice);
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
 * Returns a list of Slack user IDs of people who are at the office on the given day.
 * @param {string} date - Date string in the ISO date format.
 */
const getRegistrationsFor = async (date) => {
  const result = new Set(
    await db.getAllDefaultOfficeRegistrationsForWeekday(dfunc.getWeekday(DateTime.fromISO(date))),
  );
  const registrations = await db.getAllRegistrationsForDate(date);
  registrations.forEach((obj) => {
    if (obj.status === true) result.add(obj.slackId);
    else result.delete(obj.slackId);
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
const addJob = async (channelId, time) => db.addJob(channelId, time);

const getAllJobs = async () => db.getAllJobs();

/**
 * Returns a list of Slack user IDs of people who are at the office for every weekday
 * between firstDate and lastDate (inclusive).
 * Returns a dictionary of sets.
 * @param {string} firstDate - Date string in the ISO date format.
 * @param {string} lastDate - Date string in the ISO date format.
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
 * Returns a dictionary where key is weekday as in "Maanantai" and value tells
 * the default settings status for the given user.
 * True means office, false remote and null that there is no setting for that weekday.
 * @param {string} userId - Slack user ID.
 * @param {string} firstDate - Date string in the ISO date format.
 * @param {string} lastDate - Date string in the ISO date format.
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
 * The value for each day tells the normal registration status for the given user for that day.
 * True means office, false remote and null that there is no normal registration for that day.
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

const addOffice = async (officeName, officeEmoji) => db.addOffice(officeName, officeEmoji);

const removeOffice = async (officeId) => db.removeOffice(officeId);

const getAllOffices = async () => db.getAllOffices();

const getOffice = async (officeId) => db.getOffice(officeId);

const addDefaultOfficeForUser = async (user, officeId) =>
  db.addDefaultOfficeForUser(user, officeId);

const getDefaultOfficeForUser = async (user) => {
  const result = await db.getDefaultOfficeForUser(user);
  if (result) {
    return result;
  }
  // If no default office found for user, default to first office
  const offices = await getAllOffices();
  await addDefaultOfficeForUser(user, offices[0].id);
  return offices[0];
};

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
  addDefaultOfficeForUser,
  updateOffice,
};
