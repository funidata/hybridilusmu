const assert = require('assert');
const dfunc = require('../dateFunctions');
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
    const date = DateTime.fromObject({ year: 2021, month: 9, day: 18 })
    const result = dfunc.listNextWeek(date);
    assert.equal(result.length, 5);
    for (let i = 0; i < 5; i++) {
      assert.equal(result[i], wantedResult[i]);
    }
  });
});

describe('Weekday Matching Tests', () => {
  it('Weekday recognition test 1', () => {
    assert.equal(dfunc.matchWeekday("Torstai"), 4)
  });
  it('Weekday recognition test 2', () => {
    assert.equal(dfunc.matchWeekday("PERJANTAI"), 5)
  });
  it('Weekday recognition test 3', () => {
    assert.equal(dfunc.matchWeekday("maanantai"), 1)
  });
  it('Weekday recognition invalid day', () => {
    assert.equal(dfunc.matchWeekday("kurpitsa"), 0)
  });
  it('Weekday recognition small typo', () => {
    assert.equal(dfunc.matchWeekday("Keskviikko"), 3)
  });
  it('Weekday recognition small typo 2', () => {
    assert.equal(dfunc.matchWeekday("tistao"), 2)
  });
});

describe('Date Format Tests', () => {
     it('Invalid date test', () => {
        assert.equal(dfunc.parseDate("..").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
     it('Invalid date test 2', () => {
        assert.equal(dfunc.parseDate("asdasd").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
     it('Invalid date test 3', () => {
        assert.equal(dfunc.parseDate("1.1.2020").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
});
