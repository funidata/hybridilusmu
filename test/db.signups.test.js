const assert = require('assert');
const db = require('../src/database');
const controller = require('../src/controllers/db.controllers');

describe('Signups Tests', function () { // eslint-disable-line
    this.beforeAll(async () => {
        await db.sequelize.sync({ force: true });
    });

    it('create office date and assign to a user', async () => {
        const person = await db.Person.create({
            slack_id: 'XYZ',
        });
        await db.Signup.create({
            office_date: '2021-10-10',
            at_office: true,
            PersonId: person.id,
        });
        const p1 = await db.Person.findByPk(1, {
            include: ['signups'],
        });
        assert.equal(1, p1.signups.length);
    });
    
    it('find all users for a date', async () => {
        const person = await db.Person.create({
            slack_id: 'ZZZ',
        });
        await db.Signup.create({
            office_date: '2021-10-10',
            at_office: true,
            PersonId: person.id,
        });
        const persons = await controller.getAllOfficeRegistrationsForADate('2021-10-10');
        assert.equal(2, persons.length);
    });
    
    it('addSignUpForUser test', async () => {
        let person = await db.Person.create({
            slack_id: 'ABC',
        });
        await controller.addRegistrationForUser('ABC', '2021-10-11', true);
        person = await db.Person.findByPk(person.id, {
            include: ['signups'],
        });
        assert.equal(1, person.signups.length);
    });
    
    it('find signups for a person test', async () => {
        const userId = await controller.getPersonId('ABC');
        await controller.addRegistrationForUser('ABC', '2021-10-12', true);
        const signups = await controller.getAllRegistrationDatesForAUser(userId);
        assert.equal(2, signups.length);
        assert.equal('2021-10-11', signups[0]);
    });
    
    it('removeSignup test', async () => {
        await controller.removeRegistration('ABC', '2021-10-11');
        const signups = await controller.getAllRegistrationDatesForAUser(3);
        assert.equal(1, signups.length);
    });
});
