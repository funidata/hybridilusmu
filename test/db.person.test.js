const assert = require('assert');
const db = require('../src/database');
const controller = require('../src/controllers/db.controllers');

describe('Persons test', function () { // eslint-disable-line
    this.beforeAll(async () => {
        await db.sequelize.sync({ force: true });
    });

    it('Create a person.', async () => {
        const person = await db.Person.create({
            slackId: 'XYZ',
        });
        assert.equal(person.id, 1);
    });

    it('getPersonId test', async () => {
        const id = await controller.getPersonId('XYZ');
        assert.equal(1, id);
    });
});
