const db = require("../database");
const assert = require('assert');
const controller = require("../controllers/db.controllers");
const service = require("../databaseService.js");
const { publicEncrypt, sign } = require("crypto");

describe('databaseService tests', function() {

    this.beforeAll(async function() {
        await db.sequelize.sync({ force: true });
    });
            

    it('toggleSignup test', async function() {
        let signups = await controller.getAllOfficeSignupsForADate('2021-10-21');
        assert.equal(0, signups.length);
        await service.toggleSignup('userId', '2021-10-21', true, true);
        signups = await controller.getAllOfficeSignupsForADate('2021-10-21');
        assert.equal(1, signups.length);
    });
    
    it('toggleDefaultSignup test', async function() {
        let signups = await controller.getAllOfficeDefaultSignupsForAWeekday('Torstai');
        assert.equal(0, signups.length);
        await service.toggleDefaultSignup('userId', 'Torstai', true, true);
        signups = await controller.getAllOfficeDefaultSignupsForAWeekday('Torstai');
        assert.equal(1, signups.length);
    });
    
    it('getEnrollmentsFor test 1', async function() {
        let enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(1, enrollments.length);
        await service.toggleDefaultSignup('userId', 'Torstai', true, false);
        enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(1, enrollments.length);
    });
    
    it('getEnrollmentsFor test 2', async function() {
        await service.toggleSignup('userId', '2021-10-21', false, true);
        let enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(0, enrollments.length);
        await service.toggleDefaultSignup('userId', 'Torstai', true, true);
        enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(1, enrollments.length);
    });

    it('getEnrollmentsFor test 3', async function() {
        await service.toggleSignup('userId2', '2021-10-21', true, true);
        let enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(2, enrollments.length);
        await service.toggleDefaultSignup('userId3', 'Torstai', true, true);
        enrollments = await service.getEnrollmentsFor('2021-10-21');
        assert.equal(3, enrollments.length);
    });

});
