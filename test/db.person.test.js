const assert = require('assert');
const db = require('../database');
const controller = require('../controllers/db.controllers');

describe('Persons test', function () {
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
        const slack_id = await controller.getSlackId(1);
        assert.equal('XYZ', slack_id);
    });
});
