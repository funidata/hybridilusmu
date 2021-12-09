const assert = require('assert');
const database = require('../src/database');
const db = require('../src/controllers/db.controllers');
const service = require('../src/databaseService');

describe('ChangeRegistration Tests', function () { // eslint-disable-line
    this.beforeAll(async () => {
        await database.sequelize.sync({ force: true });
    });

    // Samassa describe():ssä olevat testit muokkaavat samaa tietokantaa,
    // joten seuraavat testit muodostavat yhden "tarinan".

    it('Adding a normal registration works.', async () => {
        let registrations = await db.getAllRegistrationsForDate('2021-10-21');
        assert.equal(registrations.length, 0);
        await service.changeRegistration('userId', '2021-10-21', true, true);
        registrations = await db.getAllRegistrationsForDate('2021-10-21');
        assert.equal(registrations.length, 1);
    });

    it('Removing a normal registration works.', async () => {
        let registrations = await db.getAllRegistrationsForDate('2021-10-21');
        assert.equal(registrations.length, 1);
        await service.changeRegistration('userId', '2021-10-21', false);
        registrations = await db.getAllRegistrationsForDate('2021-10-21');
        assert.equal(registrations.length, 0);
    });

    it('Changing a normal registration works.', async () => {
        let registrations = await db.getAllRegistrationsForDate('2021-10-21');
        assert.equal(registrations.length, 0);
        await service.changeRegistration('userId', '2021-10-21', true, true);
        registrations = await db.getAllRegistrationsForDate('2021-10-21');
        assert.equal(registrations.length, 1);
        await service.changeRegistration('userId', '2021-10-21', true, false);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 0);
    });

    it('Adding a default registration works.', async () => {
        let registrations = await db.getAllDefaultOfficeRegistrationsForWeekday('Torstai');
        assert.equal(registrations.length, 0);
        await service.changeDefaultRegistration('userId', 'Torstai', true, true);
        registrations = await db.getAllDefaultOfficeRegistrationsForWeekday('Torstai');
        assert.equal(registrations.length, 1);
    });

    it('Removing a default registration works.', async () => {
        let registrations = await db.getAllDefaultOfficeRegistrationsForWeekday('Torstai');
        assert.equal(registrations.length, 1);
        await service.changeDefaultRegistration('userId', 'Torstai', false);
        registrations = await db.getAllDefaultOfficeRegistrationsForWeekday('Torstai');
        assert.equal(registrations.length, 0);
    });

    it('Changing a default registration works.', async () => {
        let registrations = await db.getAllDefaultOfficeRegistrationsForWeekday('Torstai');
        assert.equal(registrations.length, 0);
        await service.changeDefaultRegistration('userId', 'Torstai', true, true);
        registrations = await db.getAllDefaultOfficeRegistrationsForWeekday('Torstai');
        assert.equal(registrations.length, 1);
        await service.changeDefaultRegistration('userId', 'Torstai', true, false);
        registrations = await db.getAllDefaultOfficeRegistrationsForWeekday('Torstai');
        assert.equal(registrations.length, 0);
    });
});

describe('GetRegistrationsFor Tests', function () { // eslint-disable-line
    this.beforeAll(async () => {
        await database.sequelize.sync({ force: true });
    });

    // Samassa describe():ssä olevat testit muokkaavat samaa tietokantaa,
    // joten seuraavat testit muodostavat yhden "tarinan".

    it('Adding a normal registration and a default registration increases participant count by 2.', async () => {
        await service.changeRegistration('userId1', '2021-10-21', true, true);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);
        await service.changeDefaultRegistration('userId2', 'Torstai', true, true);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(2, registrations.length);

        // Poistetaan äskeiset ilmoittautumiset
        await service.changeRegistration('userId1', '2021-10-21', false);
        await service.changeDefaultRegistration('userId2', 'Torstai', false);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(0, registrations.length);
    });

    it('Adding a normal registration that matches with default registration, does not change anything.', async () => {
        await service.changeDefaultRegistration('userId', 'Torstai', true, true);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);
        await service.changeRegistration('userId', '2021-10-21', true, true);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);
    });

    it('Adding a normal registration with different value overwrites the default registration.', async () => {
        await service.changeRegistration('userId', '2021-10-21', true, false);
        const registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(0, registrations.length);
    });

    it('Changing default registration does not overwrite an already made normal registration.', async () => {
        await service.changeRegistration('userId', '2021-10-21', true, true);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);
        await service.changeDefaultRegistration('userId', 'Torstai', true, false);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);
    });

    it('Removing default registration does not remove an already made normal registration.', async () => {
        await service.changeDefaultRegistration('userId', 'Torstai', false);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);

        // Poistetaan taas ilmoittautumiset
        await service.changeRegistration('userId', '2021-10-21', false);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(0, registrations.length);
    });

    it('Default registration registers if there is no normal registration for that day.', async () => {
        await service.changeDefaultRegistration('userId', 'Torstai', true, true);
        const registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);
    });
});
