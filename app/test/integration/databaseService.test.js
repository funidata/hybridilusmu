const { DateTime } = require('luxon');
const assert = require('assert');
const database = require('../../src/models/index');
const db = require('../../src/controllers/db.controllers');
const service = require('../../src/databaseService');
const dfunc = require('../../src/dateFunctions');

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

describe.skip('GetRegistrationsFor Tests', function () { // eslint-disable-line
    this.beforeAll(async () => {
        await database.sequelize.sync({ force: true });
    });

    // Samassa describe():ssä olevat testit muokkaavat samaa tietokantaa,
    // joten seuraavat testit muodostavat yhden "tarinan".

    it('Adding a normal registration and a default registration increases participant count by 2.', async () => {
        await service.changeRegistration('userId1', '2021-10-21', true, true);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 1);
        await service.changeDefaultRegistration('userId2', 'Torstai', true, true);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 2);

        // Poistetaan äskeiset ilmoittautumiset
        await service.changeRegistration('userId1', '2021-10-21', false);
        await service.changeDefaultRegistration('userId2', 'Torstai', false);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 0);
    });

    it('Adding a normal registration that matches with default registration, does not change anything.', async () => {
        await service.changeDefaultRegistration('userId', 'Torstai', true, true);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 1);
        await service.changeRegistration('userId', '2021-10-21', true, true);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 1);
    });

    it('Adding a normal registration with different value overwrites the default registration.', async () => {
        await service.changeRegistration('userId', '2021-10-21', true, false);
        const registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 0);
    });

    it('Changing default registration does not overwrite an already made normal registration.', async () => {
        await service.changeRegistration('userId', '2021-10-21', true, true);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 1);
        await service.changeDefaultRegistration('userId', 'Torstai', true, false);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 1);
    });

    it('Removing default registration does not remove an already made normal registration.', async () => {
        await service.changeDefaultRegistration('userId', 'Torstai', false);
        let registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 1);

        // Poistetaan taas ilmoittautumiset
        await service.changeRegistration('userId', '2021-10-21', false);
        registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 0);
    });

    it('Default registration registers if there is no normal registration for that day.', async () => {
        await service.changeDefaultRegistration('userId', 'Torstai', true, true);
        const registrations = await service.getRegistrationsFor('2021-10-21');
        assert.equal(registrations.length, 1);
    });
});

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

describe.skip('Database service tests', function () { // eslint-disable-line
    const signupTrueDic = {};
    const signupFalseDic = {};
    const defaultTrueDic = {};
    const defaultFalseDic = {};

    this.beforeAll(async () => {
        await database.sequelize.sync({ force: true });
    });

    it('Populate database', async () => {
        let date = DateTime.fromISO('2021-12-13');
        const endDate = DateTime.fromISO('2021-12-17');
        while (date <= endDate) {
            const isoDate = date.toISODate();
            signupTrueDic[isoDate] = new Set();
            signupFalseDic[isoDate] = new Set();
            defaultTrueDic[dfunc.getWeekday(date)] = new Set();
            defaultFalseDic[dfunc.getWeekday(date)] = new Set();
            if (dfunc.isWeekday(date)) {
                for (let i = 0; i < 5; i += 1) {
                    let rand = getRandomInt(3);
                    if (rand === 0) {
                        await service.changeRegistration(`userId${i}`, isoDate, true, true); // eslint-disable-line
                        signupTrueDic[isoDate].add(`userId${i}`);
                    } else if (rand === 1) {
                        await service.changeRegistration(`userId${i}`, isoDate, true, false); // eslint-disable-line
                        signupFalseDic[isoDate].add(`userId${i}`);
                    }
                    rand = getRandomInt(3);
                    // Arvotaan oletusasetukset myös
                    if (rand === 0) {
                        await service.changeDefaultRegistration(`userId${i}`, dfunc.getWeekday(date), true, true); // eslint-disable-line
                        defaultTrueDic[dfunc.getWeekday(date)].add(`userId${i}`);
                    } else if (rand === 1) {
                        await service.changeDefaultRegistration(`userId${i}`, dfunc.getWeekday(date), true, false); // eslint-disable-line
                        defaultFalseDic[dfunc.getWeekday(date)].add(`userId${i}`);
                    }
                }
            }
            date = date.plus({ days: 1 });
        }
    });

    it('GetRegistrationsBetween Tests', async () => {
        for (let i = 0; i < 5; i += 1) {
            let startInd = getRandomInt(5);
            let endInd = getRandomInt(5);
            if (startInd > endInd) {
                [startInd, endInd] = [endInd, startInd];
            }
            let date = DateTime.fromISO('2021-12-13').plus({ days: startInd });
            const endDate = DateTime.fromISO('2021-12-13').plus({ days: endInd });
            const result = await service.getRegistrationsBetween(date.toISODate(), endDate.toISODate()); // eslint-disable-line
            while (date <= endDate) {
                const isoDate = date.toISODate();
                for (let j = 0; j < 5; j += 1) {
                    const atOffice = signupTrueDic[isoDate].has(`userId${j}`)
                    || (!signupFalseDic[isoDate].has(`userId${j}`) && defaultTrueDic[dfunc.getWeekday(date)].has(`userId${j}`));
                    assert.equal(result[isoDate].has(`userId${j}`), atOffice);
                }
                date = date.plus({ days: 1 });
            }
        }
    });

    it('getDefaultSettingsForUser Tests', async () => {
        for (let i = 0; i < 5; i += 1) {
            const result = await service.getDefaultSettingsForUser(`userId${i}`); // eslint-disable-line
            let date = DateTime.fromISO('2021-12-13');
            const endDate = DateTime.fromISO('2021-12-17');
            while (date <= endDate) {
                let atOffice = null;
                if (defaultTrueDic[dfunc.getWeekday(date)].has(`userId${i}`)) {
                    atOffice = true;
                } else if (defaultFalseDic[dfunc.getWeekday(date)].has(`userId${i}`)) {
                    atOffice = false;
                }
                assert.equal(result[dfunc.getWeekday(date)], atOffice);
                date = date.plus({ days: 1 });
            }
        }
    });

    it('getRegistrationsForUserBetween Tests', async () => {
        for (let i = 0; i < 5; i += 1) {
            const result = await service.getRegistrationsForUserBetween(`userId${i}`, '2021-12-13', '2021-12-17'); // eslint-disable-line
            let date = DateTime.fromISO('2021-12-13');
            const endDate = DateTime.fromISO('2021-12-17');
            while (date <= endDate) {
                const isoDate = date.toISODate();
                let atOffice = null;
                if (signupTrueDic[isoDate].has(`userId${i}`)) {
                    atOffice = true;
                } else if (signupFalseDic[isoDate].has(`userId${i}`)) {
                    atOffice = false;
                }
                assert.equal(result[isoDate], atOffice);
                date = date.plus({ days: 1 });
            }
        }
    });
});

describe.skip('Job', function () { // eslint-disable-line
    this.beforeEach(async () => {
        await database.sequelize.sync({ force: true });
    });

    it('can be added with a time value', async () => {
        let jobs = await db.getAllJobs();
        assert.equal(jobs.length, 0);
        await service.addJob('CHANNELID', '13:00');
        jobs = await db.getAllJobs();
        assert.equal(jobs.length, 1);
    });

    it('can be added without a time value', async () => {
        let jobs = await db.getAllJobs();
        assert.equal(jobs.length, 0);
        await service.addJob('CHANNELID');
        jobs = await db.getAllJobs();
        assert.equal(jobs.length, 1);
    });

    it('can be added in multiples at a time with time values', async () => {
        let jobs = await db.getAllJobs();
        assert.equal(jobs.length, 0);
        const data = [
            {
                channel_id: 'CHANNELID1',
                time: '01:00',
            },
            {
                channel_id: 'CHANNELID2',
                time: '02:00',
            },
        ];
        await service.addAllJobs(data);
        jobs = await db.getAllJobs();
        assert.equal(jobs.length, 2);
    });

    it('can be added in multiples at a time with or without time values', async () => {
        let jobs = await db.getAllJobs();
        assert.equal(jobs.length, 0);
        const data1 = [
            {
                channel_id: 'CHANNELID1',
            },
            {
                channel_id: 'CHANNELID2',
                time: '02:00',
            },
        ];
        await service.addAllJobs(data1);
        jobs = await db.getAllJobs();
        assert.equal(jobs.length, 2);
    });

    it('can be removed', async () => {
        let jobs = await db.getAllJobs();
        assert.equal(jobs.length, 0);
        await service.addJob('CHANNELID');
        jobs = await db.getAllJobs();
        assert.equal(jobs.length, 1);

        await service.removeJob('CHANNELID');
        jobs = await db.getAllJobs();
        assert.equal(jobs.length, 0);
    });
});
