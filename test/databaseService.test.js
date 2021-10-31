const db = require("../database");
const assert = require('assert');
const controller = require("../controllers/db.controllers");
const service = require("../databaseService.js");
const { publicEncrypt, sign } = require("crypto");

describe('DatabaseService Tests', function() {

    this.beforeAll(async function() {
        await db.sequelize.sync({ force: true });
    });
            
    it('ToggleSignup test, adding a registration works.', async function() {
        let registrations = await controller.getAllOfficeSignupsForADate('2021-10-21');
        assert.equal(0, registrations.length);
        await service.changeRegistration('userId', '2021-10-21', true, true);
        registrations = await controller.getAllOfficeSignupsForADate('2021-10-21');
        assert.equal(1, registrations.length);
    });
    
    it('ToggleDefaultSignup test, adding a default registration works.', async function() {
        let registrations = await controller.getAllOfficeDefaultSignupsForAWeekday('Torstai');
        assert.equal(0, registrations.length);
        await service.changeDefaultRegistration('userId', 'Torstai', true, true);
        registrations = await controller.getAllOfficeDefaultSignupsForAWeekday('Torstai');
        assert.equal(1, registrations.length);
    });
    
    it('GetEnrollmentsFor test, changing default to "Etana" does not overwrite already made normal office registration.', async function() {
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);
        await service.changeDefaultRegistration('userId', 'Torstai', true, false);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);
    });
    
    it('GetEnrollmentsFor test, default registration registers if no normal registration for that day.', async function() {
        await service.changeRegistration('userId', '2021-10-21', false, true);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(0, registrations.length);
        await service.changeDefaultRegistration('userId', 'Torstai', true, true);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(1, registrations.length);
    });

    it('GetEnrollmentsFor test, many users registering with normal and default registration increases the amount of participants.', async function() {
        await service.changeRegistration('userId2', '2021-10-21', true, true);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(2, registrations.length);
        await service.changeDefaultRegistration('userId3', 'Torstai', true, true);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(3, registrations.length);
    });
    
});
