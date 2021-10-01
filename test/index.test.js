const assert = require('assert');
const logic = require('../logic');

describe('Weekdays Test', () => {
 it('Basic test', () => {
        const wantedResult = [
            'Maanantai 20.9.',
            'Tiistai 21.9.',
            'Keskiviikko 22.9.',
            'Torstai 23.9.',
            'Perjantai 24.9.',
        ]
        const date = new Date('Sep 18 2021 21:52:56 GMT+0300 (Eastern European Summer Time)');
        const result = logic.generateNextWeek(date);
        assert.equal(result.length, 5);
        for (let i = 0; i < 5; i++) {
            assert.equal(result[i], wantedResult[i]);
        }
    });
});

describe('Date Format Tests', () => {

});
