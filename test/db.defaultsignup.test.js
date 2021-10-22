const db = require("../database");
const assert = require('assert');
const controller = require("../controllers/db.controllers");
const { publicEncrypt, sign } = require("crypto");

describe('default signups test', function() {

    this.beforeAll(async function() {
        await db.sequelize.sync({ force: true });
    });
            

    it('create weekday default and assign to a user', async function() {
        const person = await db.Person.create({
            id: 1,
            slack_id: 'XYZ',
            real_name: 'Matti Meikalainen'
        });
        const su1 = await db.Defaultsignup.create({
            weekday: 'Maanantai',
            at_office: true,
            PersonId: 1
        });
        const p1 = await db.Person.findByPk(1, {
            include: ["defaultsignups"]
        });
        assert.equal(1, p1.defaultsignups.length);
    });
    it('find all default users for a weekday', async function() {
        const p2 = await db.Person.create({
            id: 2,
            slack_id: 'ZZZ',
            real_name: 'Maija Mehilainen'
        });
        const su2 = await db.Defaultsignup.create({
            weekday: 'Maanantai',
            at_office: true,
            PersonId: 2
        });

        const persons = await controller.getAllOfficeDefaultSignupsForAWeekday('Maanantai');
        
        assert.equal(2, persons.length);

    });
    it('addDefaultSignupForUser test', async function() {
        const p2 = await db.Person.create({
            id: 3,
            slack_id: 'ABC',
            real_name: 'Tyyppi Tyyppinen'
        });
        await controller.addDefaultSignupForUser('ABC', 'Tiistai', true);
        const person = await db.Person.findByPk(1, {
            include: ["defaultsignups"]
        });
        assert.equal(1, person.defaultsignups.length); 
    });
    it('removeDefaultSignup test', async function() {
        let signup = await controller.getOfficeDefaultSignupForUserAndWeekday('ABC', 'Tiistai');
        assert.notEqual(undefined, signup);
        await controller.removeDefaultSignup('ABC', 'Tiistai');
        signup = await controller.getOfficeDefaultSignupForUserAndWeekday('ABC', 'Tiistai');
        assert.equal(undefined, signup);
    })
    

});
