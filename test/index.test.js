const assert = require('assert');
const logic = require('../logic');
const { DateTime } = require("luxon");

describe('Generate Weekdays Test', () => {
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

describe('Weekday Matching Tests', () => {
  it('Weekday recognition test 1', () => {
    assert.equal(logic.matchWeekday("Torstai"), 4)
  });
  it('Weekday recognition test 2', () => {
    assert.equal(logic.matchWeekday("PERJANTAI"), 5)
  });
  it('Weekday recognition test 3', () => {
    assert.equal(logic.matchWeekday("maanantai"), 1)
  });
  it('Weekday recognition invalid day', () => {
    assert.equal(logic.matchWeekday("kurpitsa"), 0)
  });
  it('Weekday recognition small typo', () => {
    assert.equal(logic.matchWeekday("Keskviikko"), 3)
  });
  it('Weekday recognition small typo 2', () => {
    assert.equal(logic.matchWeekday("tistao"), 2)
  });
});

describe('Date Format Tests', () => {
     it('Invalid date test', () => {
        assert.equal(logic.parseDate("..").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
     it('Invalid date test 2', () => {
        assert.equal(logic.parseDate("asdasd").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
     it('Invalid date test 3', () => {
        assert.equal(logic.parseDate("1.1.2020").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
});
