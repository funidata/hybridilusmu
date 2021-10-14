const { Sequelize, sequelize } = require("../database");
const db = require("../database");
const Person = db.Person;
const Signup = db.Signup;
const Op = Sequelize.Op;

const getUser = async (userId, transaction) => {
    const userQuery = await Person.findOrCreate({
        where: {
            slack_id: userId,
        },
        defaults: {
            real_name: 'Nope'
        },
        transaction: transaction
    })

    return userQuery[0].dataValues
}

exports.findUserId = (slack_id) => {
    return Person.findOne({
        attributes: ['id'],
        where: {
            slack_id: slack_id,
        }
    })
    .then((p) => {
        return p.id;
    })
    .catch((err) => {
        //console.log('error while finding id ', err);
        return null;
    });
};



exports.addSignupForUser = async (userId, date, atOffice) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t)

            const signup = await Signup.upsert({
                office_date: date,
                at_office: atOffice,
                PersonId: user.id,
            }, {transaction: t})

            return signup
        })
    } catch (err) {
        console.log("Error while adding a sign up ", err);
    }
}


// hakee tietylle päivämäärälle ilmoittautuneet käyttäjät
// palauttaa arrayn käyttäjien id:stä
exports.getAllOfficeSignupsForADate = (date) => {
    return Signup.findAll({
        attributes: ['PersonId'],
        where: {
            office_date: date,
            at_office: true,
        },
        include: {model: Person, as: 'person'}
    })
    .then((signups) => {const ids = signups.map(s => s.dataValues.person.dataValues.slack_id)
        return ids;
    })
    .catch((err) => {
        console.log("Error while finding signups ", err);
    });

};


// hakee kaikki tietyn käyttäjän ilmoittautumiset, joiden at_office === atOffice
// palauttaa arrayn päivämääristä
exports.getAllOfficeSignupsForAUser = (user_id, atOffice = true) => {
    return Person.findByPk(user_id, {
        include: ['signups']
    })
    .then((person) => {
        const signups = person.signups;
        const arr = [];
        for (let i=0; i < signups.length; i++) {
            if (signups[i].at_office === atOffice) {
                arr.push(signups[i].office_date);
            }
        };
        return arr;
    })
    .catch((err) => {
        console.log("Error while finding signups ", err);
    });
};

// palauttaa Signupin käyttäjälle haluttuna päivänä
// palauttaa undefined, jos Signupia ei löydy

exports.getOfficeSignupForUserAndDate = async (userId, date) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const user = await getUser(userId, t)

            const person = await Person.findByPk(user.id, {
                include: [
                    {
                        model: Signup,
                        as: "signups",
                        where: {office_date: date}
                    }
                ],
                transaction: t
            })

            // if nothing is found, escape early
            if (!person) {
                return undefined
            }

            const signups = person.signups;
            return (signups && signups.length === 1) ? signups[0].dataValues : undefined;
        })
        return result
    } catch (err) {
        console.log("Error while finding signups ", err);
    }
}

exports.addUser = (user) => {
    return Person.upsert({
        slack_id: user.id,
        real_name: user.real_name
    })
    .then((person) => {
        return person;
    })
    .catch((err) => {
        console.log("Error while creating a person ", err);
    });
};

exports.getSlackId = (id) => {
    return Person.findByPk(id)
    .then((user) => {
        return user.slack_id;
    })
    .catch((err) => {
        console.log("Error while finding slack id ", err);
    });
};

exports.removeSignup = async (userId, date) => {
    try {
        const result = await sequelize.transaction(async t => {
            const user = await getUser(userId, t)

            await Signup.destroy({
                where: {
                    office_date: date,
                    PersonId: user.id
                }
            })
        })
    } catch (err) {
        console.log("Error while removing signup ", err);
    }
}
