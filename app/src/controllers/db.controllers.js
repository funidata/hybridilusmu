const { Op } = require("sequelize");
const { sequelize } = require("../models/index");

const { Person, Signup, Defaultsignup, Job, ScheduledMessage, Office } = require("../models");
/**
 * Returns a row from the People table that matches the Slack user ID.
 * The row contains the following:
 * - Primary key
 * - Slack user ID
 * - Time when this row was created and last updated. These are added by Sequalize.
 * @param {String} userId - Slack user ID.
 * @param {*} transaction - Transcation object, with which this query can be made part of the given transaction.
 * @returns {Array}
 */
const getUser = async (userId, transaction) => {
  const userQuery = await Person.findOrCreate({
    where: {
      slackId: userId,
    },
    transaction,
  });
  return userQuery[0].dataValues;
};

/**
 * Checks, if a user has a registration for the given date already.
 * Returns on object with properties {count, rows}:
 * - count is the amount of rows on the query
 * - rows are the rows in question
 * @param {String} personId - Primary key of the Person table, identifying the user.
 * @param {String} date - Date in the ISO date format.
 * @param {*} transaction - Transcation object, with which this query can be made part of the given transaction.
 * @returns {Object}
 */
const getRegistrationsForUserAndDate = async (personId, date, transaction) =>
  Signup.findAndCountAll({
    where: {
      officeDate: date,
      PersonId: personId,
    },
    transaction,
  });

/**
 * Checks, if user has a default registration for the given weekday already.
 * Returns on object with properties {count, rows}:
 * - count is the amount of rows on the query
 * - rows are the rows in question
 * @param {String} personId - Primary key of the Person table, identifying the user.
 * @param {String} weekday - Weekday as in "Maanantai".
 * @param {*} transaction - Transcation object, with which this query can be made part of the given transaction.
 * @returns {Object}
 */
const getDefaultRegistrationsForUserAndWeekday = async (personId, weekday, transaction) =>
  Defaultsignup.findAndCountAll({
    where: {
      weekday,
      PersonId: personId,
    },
    transaction,
  });

/**
 * Adds a normal registration for the given user, office and date.
 * @param {String} userId - Slack user ID.
 * @param {string} officeId - Office ID string.
 * @param {String} date - Date in the ISO date format.
 * @param {Boolean} atOffice - True, if we want to add an office registration. False otherwise.
 */
exports.addRegistrationForUser = async (userId, officeId, date, atOffice) => {
  try {
    await sequelize.transaction(async (t) => {
      const person = await getUser(userId, t);
      const data = await getRegistrationsForUserAndDate(person.id, date, t);
      if (data.count === 0) {
        // Let's add a new registration.
        await Signup.create(
          {
            officeDate: date,
            atOffice,
            PersonId: person.id,
            OfficeId: officeId,
          },
          {
            transaction: t,
          },
        );
      } else if (data.count === 1) {
        // Let's modify an existing registration.
        const row = data.rows[0].dataValues;
        await Signup.update(
          {
            atOffice,
            OfficeId: officeId,
          },
          {
            where: { id: row.id },
          },
          {
            transaction: t,
          },
        );
      } else {
        console.log(
          "Error! The database seems to have more than one registration for the same user with the same date.",
        );
      }
    });
  } catch (error) {
    console.log("Error while adding a registration:", error);
  }
};

/**
 * Adds a default registration for the given user, office and weekday.
 * @param {String} userId - Slack user ID.
 * @param {string} officeId - Office ID string.
 * @param {String} weekday - Weekday as in "Maanantai".
 * @param {Boolean} atOffice - True, if we want to add an office registration. False otherwise.
 */
exports.addDefaultRegistrationForUser = async (userId, officeId, weekday, atOffice) => {
  try {
    await sequelize.transaction(async (t) => {
      const person = await getUser(userId, t);
      const data = await getDefaultRegistrationsForUserAndWeekday(person.id, weekday, t);
      if (data.count === 0) {
        // Let's add a new registration.
        await Defaultsignup.create(
          {
            weekday,
            atOffice,
            PersonId: person.id,
            OfficeId: officeId,
          },
          {
            transaction: t,
          },
        );
      } else if (data.count === 1) {
        // Let's modify an existing registration.
        const row = data.rows[0].dataValues;
        await Defaultsignup.update(
          {
            atOffice,
            OfficeId: officeId,
          },
          {
            where: { id: row.id },
          },
          {
            transaction: t,
          },
        );
      } else {
        console.log("Error!");
        console.log(
          "The database seems to have more than one default registration for the same user with the same day.",
        );
      }
    });
  } catch (error) {
    console.log("Error while adding a default registration:", error);
  }
};

/**
 * Removes a registration (all registrations) for the user with the given date.
 * @param {String} userId - Slack user ID.
 * @param {String} date - Date in the ISO date format.
 */
exports.removeRegistration = async (userId, date) => {
  try {
    await sequelize.transaction(async (t) => {
      const person = await getUser(userId, t);
      await Signup.destroy({
        where: {
          officeDate: date,
          PersonId: person.id,
        },
      });
    });
  } catch (error) {
    console.log("Error while removing registration:", error);
  }
};

/**
 * Removes a default registration (all registrations) for the user with the given weekday.
 * @param {String} userId - Slack user ID.
 * @param {String} date - Date in the ISO date format.
 */
exports.removeDefaultRegistration = async (userId, weekday) => {
  try {
    await sequelize.transaction(async (t) => {
      const person = await getUser(userId, t);
      await Defaultsignup.destroy({
        where: {
          weekday,
          PersonId: person.id,
        },
      });
    });
  } catch (error) {
    console.log("Error while removing default registration:", error);
  }
};

/**
 * Returns a list of users default settings.
 * Notice, that this list is not ordered according to the weekdays
 * and does not contain weekdays, which there is no entry.
 */
exports.getDefaultSettingsForUser = async (userId) => {
  try {
    const defaultSettings = await Defaultsignup.findAll({
      attributes: ["weekday", "atOffice", "OfficeId"],
      include: [
        {
          model: Person,
          as: "person",
          where: {
            slackId: userId,
          },
        },
        {
          model: Office,
          attributes: ["officeName", "officeEmoji"],
        },
      ],
    });
    return defaultSettings.map((s) => ({
      weekday: s.dataValues.weekday,
      status: s.dataValues.atOffice,
      officeId: s.dataValues.OfficeId,
      officeName: s.dataValues.Office.officeName,
      officeEmoji: s.dataValues.Office.officeEmoji,
    }));
  } catch (error) {
    console.log("Error while finding default registrations:", error);
    return null;
  }
};

/**
 * Fetches all office registrations between the given dates.
 * Returns an array, where one element is an object containing a Slack user ID, registration date,
 * registration status and office ID.
 * @param {String} startDate - Starting date in the ISO date format.
 * @param {String} endDate - Ending date in the ISO date format.
 * @param {string} [officeId] - Optional office ID string.
 * @returns {Array}
 */
exports.getAllRegistrationsForDateInterval = async (startDate, endDate, office) => {
  try {
    const registrations = await Signup.findAll({
      attributes: ["officeDate", "atOffice", "OfficeId"],
      where: {
        officeDate: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        ...(office && {
          OfficeId: office,
        }),
      },
      include: {
        model: Person,
        as: "person",
      },
    });
    return registrations.map((s) => ({
      slackId: s.dataValues.person.dataValues.slackId,
      date: s.dataValues.officeDate,
      status: s.dataValues.atOffice,
      officeId: s.dataValues.OfficeId,
    }));
  } catch (error) {
    console.log("Error while finding registrations:", error);
    return null;
  }
};

/**
 * Fetches all office registrations between the given dates for given user.
 * Returns an array, where one element is an object containing registration date,
 * registration status, office ID, office name and office emoji.
 * @param {string} userId - Slack user ID.
 * @param {String} startDate - Starting date in the ISO date format.
 * @param {String} endDate - Ending date in the ISO date format.
 * @returns {Array}
 */
exports.getRegistrationsForUserForDateInterval = async (userId, startDate, endDate) => {
  try {
    const registrations = await Signup.findAll({
      attributes: ["officeDate", "atOffice", "OfficeId"],
      where: {
        officeDate: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      include: [
        {
          model: Person,
          as: "person",
          where: {
            slackId: userId,
          },
        },
        {
          model: Office,
          attributes: ["officeName", "officeEmoji"],
        },
      ],
    });
    return registrations.map((s) => ({
      date: s.dataValues.officeDate,
      status: s.dataValues.atOffice,
      officeId: s.dataValues.OfficeId,
      officeName: s.dataValues.Office.officeName,
      officeEmoji: s.dataValues.Office.officeEmoji,
    }));
  } catch (error) {
    console.log("Error while finding registrations:", error);
    return null;
  }
};

/**
 * Fetches all default office registrations for the given office.
 * @param {object} office Office object.
 * Returns an array, where one element is an object containing a Slack user ID and weekday.
 * @returns {Array}
 */
exports.getAllDefaultOfficeSettings = async (office) => {
  try {
    const registrations = await Defaultsignup.findAll({
      attributes: ["weekday"],
      where: {
        atOffice: true,
        OfficeId: office.id,
      },
      include: {
        model: Person,
        as: "person",
      },
    });
    return registrations.map((s) => ({
      slackId: s.dataValues.person.dataValues.slackId,
      weekday: s.dataValues.weekday,
    }));
  } catch (error) {
    console.log("Error while finding registrations:", error);
    return null;
  }
};

/**
 * Fetches all normal registrations for the given date.
 * @param {String} date - Date in the ISO date format.
 * @returns {Array}
 */
exports.getAllRegistrationsForDate = async (date) => {
  try {
    const registrations = await Signup.findAll({
      attributes: ["atOffice", "OfficeId"],
      where: {
        officeDate: date,
      },
      include: {
        model: Person,
        as: "person",
        attributes: ["slackId"],
      },
    });
    return registrations.map((s) => ({
      slackId: s.dataValues.person.dataValues.slackId,
      status: s.dataValues.atOffice,
      officeId: s.dataValues.OfficeId,
    }));
  } catch (error) {
    console.log("Error while finding registrations:", error);
    return null;
  }
};

/**
 * Fetches all default office registrations for the given weekday.
 * @param {String} date - Date in the ISO date format.
 * @param {string} [officeID] Optional office id to filter the query.
 * @returns {Promise<Array>}
 */
exports.getAllDefaultOfficeRegistrationsForWeekday = async (weekday, officeId) => {
  try {
    const registrations = await Person.findAll({
      attributes: ["slackId"],
      include: {
        model: Defaultsignup,
        as: "defaultsignup",
        where: {
          weekday,
          atOffice: true,
          ...(officeId && {
            OfficeId: officeId,
          }),
        },
      },
    });
    return registrations.map((s) => s.dataValues.slackId);
  } catch (error) {
    console.log("Error while finding default registrations:", error);
    return null;
  }
};

/**
 * Checks if user has a registration for the given date and returns it.
 * Returns undefined if no registration for that date was found or for some reason an error has occured
 * and user has many registrations for the same date.
 * Returns undefined if an error occurs during the query.
 * Basically a wrapper for @getRegistrationsForUserAndDate.
 * @param {String} userId - Slack user ID.
 * @param {String} date - Date in the ISO date format.
 * @returns {Object}
 */
exports.getUsersRegistrationForDate = async (userId, date) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const user = await getUser(userId, t);
      const data = await getRegistrationsForUserAndDate(user.id, date, t);
      if (data.count === 1) return data.rows[0].dataValues;
      return undefined;
    });
    return result;
  } catch (error) {
    console.log("Error while finding registrations:", error);
    return undefined;
  }
};

/**
 * Checks if user has a default registration for the given weekday and returns it.
 * Returns undefined if no registration for that weekday was found or for some reason an error has occured
 * and user has many registrations for the same weekday.
 * Returns undefined if an error occurs during the query.
 * Basically a wrapper for @getDefaultRegistrationsForUserAndWeekday.
 * @param {String} userId - Slack user ID.
 * @param {String} weekday - Weekday as in "Maanantai".
 * @returns {Object}
 */
exports.getUsersDefaultRegistrationForWeekday = async (userId, weekday) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const user = await getUser(userId, t);
      const data = await getDefaultRegistrationsForUserAndWeekday(user.id, weekday, t);
      if (data.count === 1) return data.rows[0].dataValues;
      return undefined;
    });
    return result;
  } catch (error) {
    console.log("Error while finding registrations:", error);
    return undefined;
  }
};

/**
 * Used in testing.
 */

/**
 * Fetches all normal registrations for a user, where the registration status is the same as @atOffice.
 * Returns an array of the registration dates.
 * @param {String} personId - A primary key of People table.
 * @param {Boolean} atOffice - True, if we are fetching office registrations and false otherwise.
 * @returns {Array}
 */
exports.getAllRegistrationDatesForAUser = async (personId, atOffice = true) => {
  try {
    const registrations = await Signup.findAll({
      attributes: ["officeDate"],
      where: {
        atOffice,
        PersonId: personId,
      },
      include: { model: Person, as: "person" },
    });
    return registrations.map((s) => s.dataValues.officeDate);
  } catch (error) {
    console.log("Error while finding registrations:", error);
    return null;
  }
};

/**
 * Returns the primary key of the People table corresponding to the given Slack user ID.
 */
exports.getPersonId = async (slackId) => {
  try {
    const person = await Person.findOne({
      attributes: ["id"],
      where: {
        slackId,
      },
    });
    return person.dataValues.id;
  } catch (error) {
    console.log("Error while finding people:", error);
    return null;
  }
};

exports.removeJob = async (channelId) => {
  try {
    await Job.destroy({
      where: {
        channel_id: channelId,
      },
    });
  } catch (err) {
    console.log("Error while removing job ", err);
  }
};

/**
 * Add only those given jobs which are not already in the database.
 */
exports.addAllJobs = async (jobs) => {
  try {
    return Job.bulkCreate(jobs, {
      updateOnDuplicate: ["channel_id"], // don't mind about existing Jobs
    });
  } catch (err) {
    console.log("Error while adding all jobs ", err);
    return undefined;
  }
};
/**
 *
 * @param {string} channelId Slack channel ID.
 * @param {string} time Time string in the ISO date format.
 * @param {string} [office] Optional office ID.
 * @returns
 */
exports.addJob = async (channelId, time, officeId) => {
  try {
    return await Job.upsert({
      channel_id: channelId,
      time,
      OfficeId: officeId || null,
    });
  } catch (err) {
    console.log("Error while creating a job ", err);
    return undefined;
  }
};

exports.getJob = async (channelId) => {
  try {
    return await Job.findByPk(channelId);
  } catch (err) {
    console.log("Error while finding a job ", err);
    return undefined;
  }
};

exports.getAllJobs = async () => {
  try {
    const result = await Job.findAll();
    return result.map((r) => ({
      channelId: r.dataValues.channel_id,
      time: r.dataValues.time,
      officeId: r.dataValues.OfficeId,
    }));
  } catch (err) {
    console.log("Error while finding jobs ", err);
    return undefined;
  }
};

/**
 * Adds a scheduledMessage
 * @param {string} messageId Slack message id AKA message timestamp
 * @param {string} date Date in the ISO date format
 * @param {string} channelId Slack channel id
 * @param {string} usergroupId Slack usergroup id
 * @returns true if succesful, undefined otherwise
 */
exports.addScheduledMessage = async (messageId, date, channelId, usergroupId) => {
  try {
    return await ScheduledMessage.upsert({
      messageId: messageId,
      date: date,
      channelId: channelId,
      usergroupId: usergroupId,
    });
  } catch (err) {
    console.log("Error while creating a scheduled message", err);
    return undefined;
  }
};

/**
 * Fetches the _latest_ Slack message id for the given date, channel and usergroup
 * @param {string} date Date in the ISO date format.
 * @param {string} channelId Slack channel id
 * @param {string} usergroupId Slack usergroup id
 * @returns Sequelize virtual object containing the messageId
 * or undefined if message not found
 */
exports.getScheduledMessageId = async (date, channelId, usergroupId) => {
  try {
    return await ScheduledMessage.findOne({
      raw: true,
      attributes: ["messageId"],
      where: {
        date: date,
        channelId: channelId,
        usergroupId: usergroupId,
      },
      order: [["createdAt", "DESC"]],
    });
  } catch (err) {
    console.log("Error while finding a scheduled message ", err);
    return undefined;
  }
};
/**
 * Adds a new office.
 * @param {string} officeName Name of the office.
 * @param {string} officeEmoji Emoji for the office in format ":emoji:".
 * @returns true if successful, undefined otherwise.
 */
exports.addOffice = async (officeName, officeEmoji) => {
  try {
    return await Office.create({
      officeName: officeName,
      officeEmoji: officeEmoji,
    });
  } catch (err) {
    console.log("Error while creating an office", err);
    return undefined;
  }
};
/**
 * Removes an office with the given ID.
 * @param {string} officeId Office id string.
 */
exports.removeOffice = async (officeId) => {
  try {
    await Office.destroy({
      where: {
        id: officeId,
      },
    });
  } catch (err) {
    console.log("Error while removing an office ", err);
    return undefined;
  }
};

/**
 * Fetches all the offices.
 * @returns An array containing all the Office objects found in the database.
 */
exports.getAllOffices = async () => {
  try {
    const result = await Office.findAll({ raw: true, order: [["id", "ASC"]] });
    return result;
  } catch (err) {
    console.log("Error while finding all offices", err);
    return undefined;
  }
};

/**
 * Fetches an office with the given id.
 * @param {string} officeId Office id string.
 */
exports.getOffice = async (officeId) => {
  try {
    const result = await Office.findOne({ raw: true, where: { id: officeId } });
    return result;
  } catch (err) {
    console.log("Error while finding an office", err);
    return undefined;
  }
};

/**
 * Fetches an office with the given name.
 * @param {string} officeName Name of the office we're finding.
 */
exports.getOfficeByName = async (officeName) => {
  try {
    const result = await Office.findOne({
      raw: true,
      where: { officeName: { [Op.iLike]: officeName } },
    });
    return result;
  } catch (err) {
    console.log("Error while finding an office with the given name", err);
    return undefined;
  }
};

/**
 * Adds a default office to the user's Person object.
 * @param {string} user Slack user ID.
 * @param {string} officeId Office ID string.
 */
exports.addDefaultOfficeForUser = async (user, officeId) => {
  try {
    const result = await Person.update({ DefaultOffice: officeId }, { where: { slackId: user } });
    if (result[0] === 0) {
      return null;
    }
  } catch (err) {
    console.log("Error while setting a default office for user", err);
    return undefined;
  }
  return true;
};

/**
 * Fetches the user's default office.
 * @param {string} user Slack user ID.
 */
exports.getDefaultOfficeForUser = async (user) => {
  try {
    const result = await Person.findOne({
      attributes: [],
      where: {
        slackId: user,
      },
      include: {
        model: Office,
      },
    });
    return result.Office.dataValues;
  } catch (err) {
    return undefined;
  }
};

/**
 * Updates the name and/or emoji of the given office.
 * @param {string} office Office ID string.
 * @param {string} newName New name for the office.
 * @param {string} newEmoji New emoji string for the office.
 */
exports.updateOffice = async (office, newName, newEmoji) => {
  try {
    const result = await Office.update(
      { officeName: newName, officeEmoji: newEmoji },
      { where: { id: office } },
    );
    // Number of affected rows
    if (result[0] === 0) {
      return null;
    }
    return result;
  } catch (err) {
    console.log("Error while updating office", err);
    return undefined;
  }
};
