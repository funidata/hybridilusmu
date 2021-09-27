const db = require("../database");
const Person = db.Person;
const Signup = db.Signups;

exports.findUserId = (slack_id) => {
    return Person.findOne({
        attributes: ['id'],
        where: {
            slack_user_id: slack_id,
        }
    })
    .then((p) => {
        return p.id;
    })
    .catch((err) => {
        console.log('error while finding id ', err);
    });
};

