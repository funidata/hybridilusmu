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
            slack_id: userId,
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
        office_date: date,
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
const getDefaultRegitrationsForUserAndWeekday = async (personId, weekday, transaction) => await Defaultsignup.findAndCountAll({
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
                    office_date: date,
                    at_office: atOffice,
                    PersonId: user.id,
                }, {
                    transaction: t
                });
            } else if (data.count === 1) { // Let's modify an existing registration.
                const row = data.rows[0].dataValues;
                await Signup.update({
                    at_office: atOffice,
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
            const data = await getDefaultRegitrationsForUserAndWeekday(user.id, weekday, t);
            if (data.count === 0) { // Let's add a new registration.
                await Defaultsignup.create({
                    weekday: weekday,
                    at_office: atOffice,
                    PersonId: user.id,
                }, {
                    transaction: t
                });
            } else if (data.count === 1) { // Let's modify an existing registration.
                const row = data.rows[0].dataValues;
                await Defaultsignup.update({
                    at_office: atOffice,
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
 * Fetches all normal registrations for the given date,
 * either office or remote registrations depending on the value of @atOffice.
 * @param {String} date - Date in the ISO date format.
 * @param {Boolean} atOffice - True, if we fetch office registrations and false, if we fetch remote registrations.
 * @returns {Array}
 */
exports.getAllOfficeRegistrationsForADate = (date, atOffice = true) => Signup.findAll({
    attributes: ['PersonId'],
    where: {
        office_date: date,
        at_office: atOffice,
    },
    include: { model: Person, as: 'person' },
})
    .then((signups) => {
        const ids = signups.map((s) => s.dataValues.person.dataValues.slack_id);
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
            if (signups[i].at_office === atOffice) {
                arr.push(signups[i].office_date);
            }
        }
        return arr;
    })
    .catch((err) => {
        console.log('Error while finding signups ', err);
    });

// palauttaa Signupin käyttäjälle haluttuna päivänä
// palauttaa undefined, jos Signupia ei löydy

exports.getOfficeSignupForUserAndDate = async (userId, date) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t);

            const person = await Person.findByPk(user.id, {
                include: [
                    {
                        model: Signup,
                        as: 'signups',
                        where: { office_date: date },
                    },
                ],
                transaction: t,
            });

            // if nothing is found, escape early
            if (!person) {
                return undefined;
            }

            const { signups } = person;
            return (signups && signups.length === 1) ? signups[0].dataValues : undefined;
        });
        return result;
    } catch (err) {
        console.log('Error while finding signups ', err);
        return undefined;
    }
};

exports.addUser = (user) => Person.upsert({
    slack_id: user.id,
})
    .then((person) => person)
    .catch((err) => {
        console.log('Error while creating a person ', err);
    });

exports.getSlackId = (id) => Person.findByPk(id)
    .then((user) => user.slack_id)
    .catch((err) => {
        console.log('Error while finding slack id ', err);
    });

/**
 * Used in testing?
 */    
exports.findUserId = (slackId) => Person.findOne({
    attributes: ['id'],
    where: {
        slack_id: slackId,
    },
})
    .then((p) => p.id)
    .catch(() => {});

exports.removeSignup = async (userId, date) => {
    try {
        await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t);

            await Signup.destroy({
                where: {
                    office_date: date,
                    PersonId: user.id,
                },
            });
        });
    } catch (err) {
        console.log('Error while removing signup ', err);
    }
};

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
        at_office: true,
    },
    include: { model: Person, as: 'person' },
})
    .then((signups) => {
        const ids = signups.map((s) => s.dataValues.person.dataValues.slack_id);
        return ids;
    })
    .catch((err) => {
        console.log('Error while finding default signups ', err);
    });

exports.getOfficeDefaultSignupForUserAndWeekday = async (userId, weekday) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t);

            const person = await Person.findByPk(user.id, {
                include: [
                    {
                        model: Defaultsignup,
                        as: 'defaultsignups',
                        where: { weekday },
                    },
                ],
                transaction: t,
            });

            // if nothing is found, escape early
            if (!person) {
                return undefined;
            }

            const signups = person.defaultsignups;
            return (signups && signups.length === 1) ? signups[0].dataValues : undefined;
        });
        return result;
    } catch (err) {
        console.log('Error while finding default signups ', err);
        return undefined;
    }
};
