const db = require("../database");
const assert = require('assert');
const { publicEncrypt } = require("crypto");

describe('signups test', function() {

    this.beforeAll(async function() {
        await db.sequelize.sync({ force: true });
    });
            

    it('create office date and assign to a user', async function() {
        const person = await db.Person.create({
            id: 1,
            slack_user_id: 'XYZ',
            real_name: 'Matti Meikalainen'
        });
        const su1 = await db.Signup.create({
            id: 2,
            office_date: '2021-10-10',
            at_office: true,
            PersonId: 1
        });
        const p1 = await db.Person.findByPk(1, {
            include: ["signups"]
        });
        assert.equal(1, p1.signups.length);
    });
    it('find all users for a date', async function() {
        const p2 = await db.Person.create({
            id: 2,
            slack_user_id: 'ZZZ',
            real_name: 'Maija Mehilainen'
        });
        const su2 = await db.Signup.create({
            id: 3,
            office_date: '2021-10-10',
            at_office: true,
            PersonId: 2
        });

        const persons = await db.Signup.findAll({
            attributes: ['PersonId'],
            where: {
                office_date: '2021-10-10',
                at_office: true
            }
            
        });
        let txt = '';
        for (let i=0; i < persons.length; i++) {
            const p = await db.Person.findByPk(persons[i].PersonId);
            txt += p.real_name + ' ';
        }
        assert.equal('Matti Meikalainen Maija Mehilainen ', txt);
    });
    

});