const { sequelize } = require('../database');
const db = require('../database');

const { Person } = db;
const { Signup } = db;
const { Defaultsignup } = db;
const { Job } = db;

const getUser = async (userId, transaction) => {
    const userQuery = await Person.findOrCreate({
        where: {
            slack_id: userId,
        },
        defaults: {
            real_name: 'Nope',
        },
        transaction,
    });

    return userQuery[0].dataValues;
};

exports.findUserId = (slackId) => Person.findOne({
    attributes: ['id'],
    where: {
        slack_id: slackId,
    },
})
    .then((p) => p.id)
    .catch(() => {});

exports.addSignupForUser = async (userId, date, atOffice) => {
    try {
        await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t);

            const signup = await Signup.upsert({
                office_date: date,
                at_office: atOffice,
                PersonId: user.id,
            }, { transaction: t });

            return signup;
        });
    } catch (err) {
        console.log('Error while adding a sign up ', err);
    }
};

// hakee tietylle päivämäärälle ilmoittautuneet käyttäjät
// palauttaa arrayn käyttäjien id:stä
// atOffice = true antaa toimistolle ilmoittautuneet ja false etänä ilmoittautuneet
exports.getAllOfficeSignupsForADate = (date, atOffice = true) => Signup.findAll({
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

// hakee kaikki tietyn käyttäjän ilmoittautumiset, joiden at_office === atOffice
// palauttaa arrayn päivämääristä
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
    real_name: user.real_name,
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

exports.addDefaultSignupForUser = async (userId, weekday, atOffice) => {
    try {
        await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t);
            const defaultsignup = await Defaultsignup.upsert({
                weekday,
                at_office: atOffice,
                PersonId: user.id,
            }, { transaction: t });
            return defaultsignup;
        });
    } catch (err) {
        console.log('Error while adding a default signup ', err);
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

// should overwrite everything
exports.resetAllJobs = (jobs) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            await Job.destroy({
                where: {},
                transaction: t,
            })

            return await Job.bulkCreate(jobs, {
                transaction: t,
            })
        });
        return result;
    } catch (err) {
        console.log('Error while resetting all jobs ', err);
        return undefined;
    }
};

// should not overwrite anything
exports.addAllJobs = (jobs) => Job.bulkCreate({
    records: jobs
})
    .then((jobs) => jobs)
    .catch((err) => {
        console.log('Error while adding jobs ', err);
    });

exports.addJob = (channelId, time) => Job.upsert({
    channel_id: channelId,
    time: time
})
    .then((job) => job)
    .catch((err) => {
        console.log('Error while creating a job ', err);
    });

exports.getJob = (channel_id) => Job.findByPk(channel_id)
    .then((job) => job)
    .catch((err) => {
        console.log('Error while finding job ', err);
    });

exports.getAllJobs = () => Job.findAll()
    .then((jobs) => jobs)
    .catch((err) => {
        console.log('Error while finding jobs ', err);
    });