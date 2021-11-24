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
const getRegistrationsForUserAndDate = async (personId, date, transaction) => await Signup.findAndCountAll({
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
const getDefaultRegistrationsForUserAndWeekday = async (personId, weekday, transaction) => await Defaultsignup.findAndCountAll({
    where: {
        weekday: weekday,
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
            const user = await getUser(userId, t);
            const data = await getRegistrationsForUserAndDate(user.id, date, t);
            if (data.count === 0) { // Let's add a new registration.
                await Signup.create({
                    officeDate: date,
                    atOffice: atOffice,
                    PersonId: user.id,
                }, {
                    transaction: t
                });
            } else if (data.count === 1) { // Let's modify an existing registration.
                const row = data.rows[0].dataValues;
                await Signup.update({
                    atOffice: atOffice,
                }, {
                    where: {
                        id: row.id,
                    }
                }, {
                    transaction: t
                });
            } else {
                console.log('Error! The database seems to have more than one registration for the same user with the same date.');
            }
        });
    } catch (error) {
        console.log('Error while adding a registration: ', error);
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
            const user = await getUser(userId, t);
            const data = await getDefaultRegistrationsForUserAndWeekday(user.id, weekday, t);
            if (data.count === 0) { // Let's add a new registration.
                await Defaultsignup.create({
                    weekday: weekday,
                    atOffice: atOffice,
                    PersonId: user.id,
                }, {
                    transaction: t
                });
            } else if (data.count === 1) { // Let's modify an existing registration.
                const row = data.rows[0].dataValues;
                await Defaultsignup.update({
                    atOffice: atOffice,
                }, {
                    where: {
                        id: row.id,
                    }
                }, {
                    transaction: t
                });
            } else {
                console.log('Error! The database seems to have more than one default registration for the same user with the same day.');
            }
        });
    } catch (err) {
        console.log('Error while adding a default registration: ', err);
    }
};

/**
 * 
 */
exports.removeRegistration = async (userId, date) => {
    try {
        await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t);
            await Signup.destroy({
                where: {
                    officeDate: date,
                    PersonId: user.id,
                },
            });
        });
    } catch (err) {
        console.log('Error while removing signup ', err);
    }
};

/**
 * Fetches all normal registrations for the given date,
 * either office or remote registrations depending on the value of @atOffice.
 * @param {String} date - Date in the ISO date format.
 * @param {Boolean} atOffice - True, if we fetch office registrations and false, if we fetch remote registrations.
 * @returns {Array}
 */
exports.getAllOfficeRegistrationsForADate = (date, atOffice = true) => Signup.findAll({
    attributes: ['PersonId'],
    where: {
        officeDate: date,
        atOffice: atOffice,
    },
    include: { model: Person, as: 'person' },
})
    .then((signups) => {
        const ids = signups.map((s) => s.dataValues.person.dataValues.slackId);
        return ids;
    })
    .catch((err) => {
        console.log('Error while finding signups ', err);
    });

/** 
 * Hakee kaikki tietyn käyttäjän ilmoittautumiset, joiden at_office === atOffice.
 * Palauttaa arrayn päivämääristä.
 */
exports.getAllOfficeSignupsForAUser = (userId, atOffice = true) => Person.findByPk(userId, {
    include: ['signups'],
})
    .then((person) => {
        const { signups } = person;
        const arr = [];
        for (let i = 0; i < signups.length; i += 1) {
            if (signups[i].atOffice === atOffice) {
                arr.push(signups[i].officeDate);
            }
        }
        return arr;
    })
    .catch((err) => {
        console.log('Error while finding signups ', err);
    });
    
exports.getOfficeSignupForUserAndDate = async (userId, date) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t);
            const data = await getRegistrationsForUserAndDate(user.id, date, t);
            if (data.count === 1) return data.rows[0].dataValues;
            return undefined;
        });
        return result;
    } catch (err) {
        console.log('Error while finding signups ', err);
        return undefined;
    }
};

exports.getOfficeDefaultSignupForUserAndWeekday = async (userId, weekday) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t);
            const data = await getDefaultRegistrationsForUserAndWeekday(user.id, weekday, t);
            if (data.count === 1) return data.rows[0].dataValues;
            return undefined;
        });
        return result;
    } catch (err) {
        console.log('Error while finding signups ', err);
        return undefined;
    }
};

exports.addUser = (user) => Person.upsert({
    slackId: user.id,
})
    .then((person) => person)
    .catch((err) => {
        console.log('Error while creating a person ', err);
    });

exports.getSlackId = (id) => Person.findByPk(id)
    .then((user) => user.slackId)
    .catch((err) => {
        console.log('Error while finding slack id ', err);
    });

/**
 * Used in testing?
 */    
exports.findUserId = (slackId) => Person.findOne({
    attributes: ['id'],
    where: {
        slackId: slackId,
    },
})
    .then((p) => p.id)
    .catch(() => {});

exports.removeDefaultSignup = async (userId, weekday) => {
    try {
        await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t);

            await Defaultsignup.destroy({
                where: {
                    weekday,
                    PersonId: user.id,
                },
            });
        });
    } catch (err) {
        console.log('Error while removing default signup ', err);
    }
};

exports.getAllOfficeDefaultSignupsForAWeekday = (weekday) => Defaultsignup.findAll({
    attributes: ['PersonId'],
    where: {
        weekday,
        atOffice: true,
    },
    include: { model: Person, as: 'person' },
})
    .then((signups) => {
        const ids = signups.map((s) => s.dataValues.person.dataValues.slackId);
        return ids;
    })
    .catch((err) => {
        console.log('Error while finding default signups ', err);
    });
