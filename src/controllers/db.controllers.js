const { Op } = require('sequelize');
const { sequelize } = require('../database');
const db = require('../database');

const { Person } = db;
const { Signup } = db;
const { Defaultsignup } = db;

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
const getRegistrationsForUserAndDate = async (personId, date, transaction) => Signup.findAndCountAll({
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
const getDefaultRegistrationsForUserAndWeekday = async (personId, weekday, transaction) => Defaultsignup.findAndCountAll({
    where: {
        weekday,
        PersonId: personId,
    },
    transaction,
});

/**
 * Adds a normal registration for the given user.
 * @param {String} userId - Slack user ID.
 * @param {String} date - Date in the ISO date format.
 * @param {Boolean} atOffice - True, if we want to add an office registration. False otherwise.
 */
exports.addRegistrationForUser = async (userId, date, atOffice) => {
    try {
        await sequelize.transaction(async (t) => {
            const person = await getUser(userId, t);
            const data = await getRegistrationsForUserAndDate(person.id, date, t);
            if (data.count === 0) { // Let's add a new registration.
                await Signup.create({
                    officeDate: date,
                    atOffice,
                    PersonId: person.id,
                }, {
                    transaction: t,
                });
            } else if (data.count === 1) { // Let's modify an existing registration.
                const row = data.rows[0].dataValues;
                await Signup.update({
                    atOffice,
                }, {
                    where: { id: row.id },
                }, {
                    transaction: t,
                });
            } else {
                console.log('Error! The database seems to have more than one registration for the same user with the same date.');
            }
        });
    } catch (error) {
        console.log('Error while adding a registration:', error);
    }
};

/**
 * Adds a default registration for the given user.
 * @param {String} userId - Slack user ID.
 * @param {String} weekday - Weekday as in "Maanantai".
 * @param {Boolean} atOffice - True, if we want to add an office registration. False otherwise.
 */
exports.addDefaultRegistrationForUser = async (userId, weekday, atOffice) => {
    try {
        await sequelize.transaction(async (t) => {
            const person = await getUser(userId, t);
            const data = await getDefaultRegistrationsForUserAndWeekday(person.id, weekday, t);
            if (data.count === 0) { // Let's add a new registration.
                await Defaultsignup.create({
                    weekday,
                    atOffice,
                    PersonId: person.id,
                }, {
                    transaction: t,
                });
            } else if (data.count === 1) { // Let's modify an existing registration.
                const row = data.rows[0].dataValues;
                await Defaultsignup.update({
                    atOffice,
                }, {
                    where: { id: row.id },
                }, {
                    transaction: t,
                });
            } else {
                console.log('Error!');
                console.log('The database seems to have more than one default registration for the same user with the same day.');
            }
        });
    } catch (error) {
        console.log('Error while adding a default registration:', error);
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
        console.log('Error while removing registration:', error);
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
        console.log('Error while removing default registration:', error);
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
            attributes: ['weekday', 'atOffice'],
            include: {
                model: Person,
                as: 'person',
                where: {
                    slackId: userId,
                },
            },
        });
        return defaultSettings.map((s) => ({
            weekday: s.dataValues.weekday,
            status: s.dataValues.atOffice,
        }));
    } catch (error) {
        console.log('Error while finding default registrations:', error);
        return null;
    }
};


/**
 * Fetches all office registrations between the given dates.
 * Returns an array, where one element is an object containing a Slack user ID, registration date and registration status.
 * @param {String} startDate - Starting date in the ISO date format.
 * @param {String} endDate - Ending date in the ISO date format.
 * @returns {Array}
 */
exports.getAllRegistrationsForDateInterval = async (startDate, endDate) => {
    try {
        const registrations = await Signup.findAll({
            attributes: ['officeDate', 'atOffice'],
            where: {
                officeDate: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            include: {
                model: Person,
                as: 'person',
            },
        });
        return registrations.map((s) => ({
            slackId: s.dataValues.person.dataValues.slackId,
            date: s.dataValues.officeDate,
            status: s.dataValues.atOffice,
        }));
    } catch (error) {
        console.log('Error while finding registrations:', error);
        return null;
    }
};

/**
 * Fetches all office registrations between the given dates for given user.
 * Returns an array, where one element is an object containing registration date and registration status.
 * @param {String} startDate - Starting date in the ISO date format.
 * @param {String} endDate - Ending date in the ISO date format.
 * @returns {Array}
 */
exports.getRegistrationsForUserForDateInterval = async (userId, startDate, endDate) => {
    try {
        const registrations = await Signup.findAll({
            attributes: ['officeDate', 'atOffice'],
            where: {
                officeDate: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            include: {
                model: Person,
                as: 'person',
                where: {
                    slackId: userId,
                },
            },
        });
        return registrations.map((s) => ({
            date: s.dataValues.officeDate,
            status: s.dataValues.atOffice,
        }));
    } catch (error) {
        console.log('Error while finding registrations:', error);
        return null;
    }
};

/**
 * Fetches all default office registrations.
 * Returns an array, where one element is an object containing a Slack user ID and weekday.
 * @returns {Array}
 */
exports.getAllDefaultOfficeSettings = async () => {
    try {
        const registrations = await Defaultsignup.findAll({
            attributes: ['weekday'],
            where: {
                atOffice: true,
            },
            include: {
                model: Person,
                as: 'person',
            },
        });
        return registrations.map((s) => ({
            slackId: s.dataValues.person.dataValues.slackId,
            weekday: s.dataValues.weekday,
        }));
    } catch (error) {
        console.log('Error while finding registrations:', error);
        return null;
    }
};

/**
 * Fetches all normal registrations for the given date,
 * either office or remote registrations depending on the value of @atOffice.
 * @param {String} date - Date in the ISO date format.
 * @param {Boolean} atOffice - True, if we fetch office registrations and false, if we fetch remote registrations.
 * @returns {Array}
 */
exports.getAllRegistrationsForDate = async (date, atOffice = true) => {
    try {
        const registrations = await Person.findAll({
            attributes: ['slackId'],
            include: {
                model: Signup,
                as: 'signup',
                where: {
                    officeDate: date,
                    atOffice,
                },
            },
        });
        return registrations.map((s) => s.dataValues.slackId);
    } catch (error) {
        console.log('Error while finding registrations:', error);
        return null;
    }
};

/**
 * Fetches all default registrations for the given weekday,
 * either office or remote registrations depending on the value of @atOffice.
 * @param {String} date - Date in the ISO date format.
 * @param {Boolean} atOffice - True, if we fetch office registrations and false, if we fetch remote registrations.
 * @returns {Array}
 */
exports.getAllDefaultRegistrationsForWeekday = async (weekday, atOffice = true) => {
    try {
        const registrations = await Person.findAll({
            attributes: ['slackId'],
            include: {
                model: Defaultsignup,
                as: 'defaultsignup',
                where: {
                    weekday,
                    atOffice,
                },
            },
        });
        return registrations.map((s) => s.dataValues.slackId);
    } catch (error) {
        console.log('Error while finding default registrations:', error);
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
        console.log('Error while finding registrations:', error);
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
        console.log('Error while finding registrations:', error);
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
            attributes: ['officeDate'],
            where: {
                atOffice,
                PersonId: personId,
            },
            include: { model: Person, as: 'person' },
        });
        return registrations.map((s) => s.dataValues.officeDate);
    } catch (error) {
        console.log('Error while finding registrations:', error);
        return null;
    }
};

/**
 * Returns the primary key of the People table corresponding to the given Slack user ID.
 */
exports.getPersonId = async (slackId) => {
    try {
        const person = await Person.findOne({
            attributes: ['id'],
            where: {
                slackId,
            },
        });
        return person.dataValues.id;
    } catch (error) {
        console.log('Error while finding people:', error);
        return null;
    }
};
