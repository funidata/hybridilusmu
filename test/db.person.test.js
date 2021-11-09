const assert = require('assert');
const db = require('../app_files/database');
const controller = require('../app_files/controllers/db.controllers');

describe('Persons test', function () { // eslint-disable-line
    this.beforeAll(async () => {
        await db.sequelize.sync({ force: true });
    });

    it('create user', async () => {
        const person = await db.Person.create({
            id: 1,
            slack_id: 'XYZ',
            real_name: 'Matti Meikalainen',
        });
        assert.equal(person.id, 1);
    });
    it('should return correct username', async () => {
        const person = await db.Person.findByPk(1);
        assert.equal(person.real_name, 'Matti Meikalainen');
    });
    it('findUserId test', async () => {
        const id = await controller.findUserId('XYZ');
        assert.equal(1, id);
    });
    it('find slack_id', async () => {
        const slackId = await controller.getSlackId(1);
        assert.equal('XYZ', slackId);
    });
});
