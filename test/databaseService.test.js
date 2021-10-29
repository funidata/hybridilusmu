const db = require("../database");
const assert = require('assert');
const controller = require("../controllers/db.controllers");
const service = require("../databaseService.js");
const { publicEncrypt, sign } = require("crypto");

describe('DatabaseService Tests', function() {

    this.beforeAll(async function() {
        await db.sequelize.sync({ force: true });
    });
            
    it('ToggleSignup test, adding a signup works.', async function() {
        let signups = await controller.getAllOfficeSignupsForADate('2021-10-21');
        assert.equal(0, signups.length);
        await service.toggleSignup('userId', '2021-10-21', true, true);
        signups = await controller.getAllOfficeSignupsForADate('2021-10-21');
        assert.equal(1, signups.length);
    });
    
    it('ToggleDefaultSignup test, adding default signup works.', async function() {
        let signups = await controller.getAllOfficeDefaultSignupsForAWeekday('Torstai');
        assert.equal(0, signups.length);
        await service.toggleDefaultSignup('userId', 'Torstai', true, true);
        signups = await controller.getAllOfficeDefaultSignupsForAWeekday('Torstai');
        assert.equal(1, signups.length);
    });
    
    it('GetEnrollmentsFor test, default to "Etana" does not overwrite already made normal office signup.', async function() {
        let enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(1, enrollments.length);
        await service.toggleDefaultSignup('userId', 'Torstai', true, false);
        enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(1, enrollments.length);
    });
    
    it('GetEnrollmentsFor test, default singup registers if no normal signup for that day.', async function() {
        await service.toggleSignup('userId', '2021-10-21', false, true);
        let enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(0, enrollments.length);
        await service.toggleDefaultSignup('userId', 'Torstai', true, true);
        enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(1, enrollments.length);
    });

    it('GetEnrollmentsFor test, many users signing up with normal and default signup increases amount of participants.', async function() {
        await service.toggleSignup('userId2', '2021-10-21', true, true);
        let enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(2, enrollments.length);
        await service.toggleDefaultSignup('userId3', 'Torstai', true, true);
        enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(3, enrollments.length);
    });
    
});
