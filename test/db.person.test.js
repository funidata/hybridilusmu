const db = require("../database");
const assert = require('assert');
const controller = require("../controllers/db.controllers");

describe('persons test', function() {

    this.beforeAll(async function() {
        await db.sequelize.sync({ force: true });
    });
            

    it('create user', async function() {
        const person = await db.Person.create({
            id: 1,
            slack_user_id: 'XYZ',
            real_name: 'Matti Meikalainen'
        });
        assert.equal(person.id, 1);
    });
    it('should return correct username', async function() {
        const person = await db.Person.findByPk(1);
        assert.equal(person.real_name, 'Matti Meikalainen');
    });
    it('findUserId test', async function() {
        const id = await controller.findUserId('XYZ');
        assert.equal(1, id);
    });

    

});