const assert = require('assert');
const { publicEncrypt, sign } = require('crypto');
const db = require('../database');
const controller = require('../controllers/db.controllers');

describe('Default signups test', function () {
    this.beforeAll(async () => {
        await db.sequelize.sync({ force: true });
    });

    it('create weekday default and assign to a user', async () => {
        const person = await db.Person.create({
            id: 1,
            slack_id: 'XYZ',
            real_name: 'Matti Meikalainen',
        });
        const su1 = await db.Defaultsignup.create({
            weekday: 'Maanantai',
            at_office: true,
            PersonId: 1,
        });
        const p1 = await db.Person.findByPk(1, {
            include: ['defaultsignups'],
        });
        assert.equal(1, p1.defaultsignups.length);
    });
    it('find all default users for a weekday', async () => {
        const p2 = await db.Person.create({
            id: 2,
            slack_id: 'ZZZ',
            real_name: 'Maija Mehilainen',
        });
        const su2 = await db.Defaultsignup.create({
            weekday: 'Maanantai',
            at_office: true,
            PersonId: 2,
        });

        const persons = await controller.getAllOfficeDefaultSignupsForAWeekday('Maanantai');

        assert.equal(2, persons.length);
    });
    it('addDefaultSignupForUser test', async () => {
        const p2 = await db.Person.create({
            id: 3,
            slack_id: 'ABC',
            real_name: 'Tyyppi Tyyppinen',
        });
        await controller.addDefaultSignupForUser('ABC', 'Tiistai', true);
        const person = await db.Person.findByPk(1, {
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
