const { Sequelize, sequelize } = require("../database");
const db = require("../database");
const Person = db.Person;
const Signup = db.Signup;
const Op = Sequelize.Op;

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
            const userQuery = await Person.findOrCreate({
                where: {
                    slack_id: userId,
                },
                defaults: {
                    real_name: 'Nope'
                },
                transaction: t
            })
            
            const user = userQuery[0].dataValues
            console.log(user)

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
        }
    })
    .then((signups) => {
        console.log("signups found for date ", date);
        const arr = [];
        for (let i=0; i < signups.length; i++) {
            const p = signups[i].PersonId;
            arr.push(p);
        };
        return arr;
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
        console.log("signups found for a user ", user_id);
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
        //console.log("Error while finding signups ", err);
    });
};

// palauttaa Signupin käyttäjälle haluttuna päivänä
// palauttaa undefined, jos Signupia ei löydy
exports.getOfficeSignupForUserAndDate = (user_id, date) => {
    return Person.findByPk(user_id, {
        include: [
            {
                model: Signup,
                as: "signups",
                where: {office_date: date}
            }
        ]
    })
    .then((person) => {
        if (!person) {
            throw `no signup found for user ${user_id} on ${date}`
        }
        console.log("signup found for user ", user_id, " on ", date);
        const signups = person.signups;
        let ret = undefined;
        for (let i=0; i < signups.length; i++) {
            ret = signups[i];
        };
        return ret;
    })
    .catch((err) => {
        console.log("Error while finding signup ", err);
    });
};

exports.addUser = (user) => {
    return Person.upsert({
        slack_id: user.id,
        real_name: user.real_name
    })
    .then((person) => {
        console.log("person created ");
        return person;
    })
    .catch((err) => {
        console.log("Error while creating a person ", err);
    });
};

exports.getSlackId = (id) => {
    return Person.findByPk(id)
    .then((user) => {
        console.log("found user ");
        return user.slack_id;
    })
    .catch((err) => {
        console.log("Error while finding slack id ", err);
    });
};

exports.removeSignup = (id, date) => {
    return Signup.destroy({
        where: {
            office_date: date,
            PersonId: id
        }
    })
    .then((signup) => {
        console.log("Signup removed ", signup);
    })
    .catch((err) => {
        console.log("Error while removing signup ", err);
    });
};

