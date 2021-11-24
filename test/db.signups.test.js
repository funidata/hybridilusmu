const assert = require('assert');
const db = require('../src/database');
const controller = require('../src/controllers/db.controllers');

describe('Signups Tests', function () { // eslint-disable-line
    this.beforeAll(async () => {
        await db.sequelize.sync({ force: true });
    });

    it('Create an office registration for a user.', async () => {
        const person = await db.Person.create({
            slackId: 'XYZ',
        });
        await db.Signup.create({
            officeDate: '2021-10-10',
            atOffice: true,
            PersonId: person.id,
        });
        const p1 = await db.Person.findByPk(1, {
            include: ['signups'],
        });
        assert.equal(1, p1.signups.length);
    });
    
    it('List all registered users for a date.', async () => {
        const person = await db.Person.create({
            slackId: 'ZZZ',
        });
        await db.Signup.create({
            officeDate: '2021-10-10',
            atOffice: true,
            PersonId: person.id,
        });
        const people = await controller.getAllRegistrationsForDate('2021-10-10');
        assert.equal(2, people.length);
    });
    
    it('addRegistrationForUser test', async () => {
        let person = await db.Person.create({
            slackId: 'ABC',
        });
        await controller.addRegistrationForUser('ABC', '2021-10-11', true);
        person = await db.Person.findByPk(person.id, {
            include: ['signups'],
        });
        assert.equal(1, person.signups.length);
    });
    
    it('Get all registrations for a user and a date.', async () => {
        const personId = await controller.getPersonId('ABC');
        await controller.addRegistrationForUser('ABC', '2021-10-12', true);
        const registrations = await controller.getAllRegistrationDatesForAUser(personId);
        assert.equal(2, registrations.length);
        assert.equal('2021-10-11', registrations[0]);
    });
    
    it('removeRegistration test', async () => {
        await controller.removeRegistration('ABC', '2021-10-11');
        const registrations = await controller.getAllRegistrationDatesForAUser(3);
        assert.equal(1, registrations.length);
    });
});
