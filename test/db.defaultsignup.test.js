const assert = require('assert');
const db = require('../src/database');
const controller = require('../src/controllers/db.controllers');

describe('Default signups test', function () { // eslint-disable-line
    this.beforeAll(async () => {
        await db.sequelize.sync({ force: true });
    });

    it('create weekday default and assign to a user', async () => {
        const person = await db.Person.create({
            slack_id: 'XYZ',
            real_name: 'Matti Meikalainen',
        });
        await db.Defaultsignup.create({
            weekday: 'Maanantai',
            at_office: true,
            PersonId: person.id,
        });
        const p1 = await db.Person.findByPk(1, {
            include: ['defaultsignups'],
        });
        assert.equal(1, p1.defaultsignups.length);
    });
    it('find all default users for a weekday', async () => {
        const person = await db.Person.create({
            slack_id: 'ZZZ',
            real_name: 'Maija Mehilainen',
        });
        await db.Defaultsignup.create({
            weekday: 'Maanantai',
            at_office: true,
            PersonId: person.id,
        });

        const persons = await controller.getAllOfficeDefaultSignupsForAWeekday('Maanantai');

        assert.equal(2, persons.length);
    });
    it('addDefaultSignupForUser test', async () => {
        let person = await db.Person.create({
            slack_id: 'ABC',
            real_name: 'Tyyppi Tyyppinen',
        });
        await controller.addDefaultSignupForUser('ABC', 'Tiistai', true);
        person = await db.Person.findByPk(person.id, {
            include: ['defaultsignups'],
        });
        assert.equal(1, person.defaultsignups.length);
    });
    it('removeDefaultSignup test', async () => {
        let signup = await controller.getOfficeDefaultSignupForUserAndWeekday('ABC', 'Tiistai');
        assert.notEqual(undefined, signup);
        await controller.removeDefaultSignup('ABC', 'Tiistai');
        signup = await controller.getOfficeDefaultSignupForUserAndWeekday('ABC', 'Tiistai');
        assert.equal(undefined, signup);
    });
});
