const assert = require('assert');
const dfunc = require('../dateFunctions');
const { DateTime } = require("luxon");

describe('List Next Week Test', () => {
  it('Asked on Monday', () => {
    const wantedResult = [
        'Maanantai 3.1.',
        'Tiistai 4.1.',
        'Keskiviikko 5.1.',
        'Torstai 6.1.',
        'Perjantai 7.1.',
    ]
    const date = DateTime.fromObject({ year: 2021, month: 12, day: 27 })
    const result = dfunc.listNextWeek(date);
    assert.equal(result.length, wantedResult.length);
    for (let i = 0; i < result.length; i++) {
      assert.equal(result[i], wantedResult[i]);
    }
  });
  it('Asked on Saturday', () => {
    const wantedResult = [
        'Maanantai 20.9.',
        'Tiistai 21.9.',
        'Keskiviikko 22.9.',
        'Torstai 23.9.',
        'Perjantai 24.9.',
    ]
    const date = DateTime.fromObject({ year: 2021, month: 9, day: 18 })
    const result = dfunc.listNextWeek(date);
    assert.equal(result.length, wantedResult.length);
    for (let i = 0; i < result.length; i++) {
      assert.equal(result[i], wantedResult[i]);
    }
  });
  it('Asked on Sunday', () => {
    const wantedResult = [
        'Maanantai 1.11.',
        'Tiistai 2.11.',
        'Keskiviikko 3.11.',
        'Torstai 4.11.',
        'Perjantai 5.11.',
    ]
    const date = DateTime.fromObject({ year: 2021, month: 10, day: 31 })
    const result = dfunc.listNextWeek(date);
    assert.equal(result.length, wantedResult.length);
    for (let i = 0; i < result.length; i++) {
      assert.equal(result[i], wantedResult[i]);
    }
  });
});

describe('List N Weekdays Test', () => {
  it('Calculate starting from Monday, 6 days', () => {
    const wantedResult = [
        '2021-10-25',
        '2021-10-26',
        '2021-10-27',
        '2021-10-28',
        '2021-10-29',
        '2021-11-01'
    ]
    const date = DateTime.fromObject({ year: 2021, month: 10, day: 25 })
    const result = dfunc.listNWeekdays(date, 6);
    assert.equal(result.length, wantedResult.length);
    for (let i = 0; i < result.length; i++) {
      assert.equal(result[i], wantedResult[i]);
    }
  });
  it('Calculate starting from Thursday, 5 days', () => {
    const wantedResult = [
        '2021-10-14',
        '2021-10-15',
        '2021-10-18',
        '2021-10-19',
        '2021-10-20'
    ]
    const date = DateTime.fromObject({ year: 2021, month: 10, day: 14 })
    const result = dfunc.listNWeekdays(date, 5);
    assert.equal(result.length, wantedResult.length);
    for (let i = 0; i < result.length; i++) {
      assert.equal(result[i], wantedResult[i]);
    }
  });
  it('Calculate starting from Saturday, 5 days', () => {
    const wantedResult = [
        '2021-10-18',
        '2021-10-19',
        '2021-10-20',
        '2021-10-21',
        '2021-10-22'
    ]
    const date = DateTime.fromObject({ year: 2021, month: 10, day: 16 })
    const result = dfunc.listNWeekdays(date, 5);
    assert.equal(result.length, wantedResult.length);
    for (let i = 0; i < result.length; i++) {
      assert.equal(result[i], wantedResult[i]);
    }
  });
});

describe('Parse Date Tests', () => {
    it('Empty string', () => {
        assert.equal(dfunc.parseDate("").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
    it('Input is not a date string', () => {
        assert.equal(dfunc.parseDate("asdasdasd").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
    it('Input is not of form numeral.numeral or numeral.numeral.', () => {
        assert.equal(dfunc.parseDate("1.1.2020").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
    it('Input is not of form numeral.numeral or numeral.numeral.', () => {
        assert.equal(dfunc.parseDate("1234.1234").toString(), DateTime.fromObject({ day: 0 }).toString())
    });
});

describe('Match Weekday Tests', () => {
  it('First letter is capital', () => {
    assert.equal(dfunc.matchWeekday("Torstai"), 4)
  });
  it('All letters capital', () => {
    assert.equal(dfunc.matchWeekday("PERJANTAI"), 5)
  });
  it('All letters small', () => {
    assert.equal(dfunc.matchWeekday("maanantai"), 1)
  });
  it('Input string is not a weekday', () => {
    assert.equal(dfunc.matchWeekday("kurpitsa"), 0)
  });
  it('Input string is not a weekday', () => {
    assert.equal(dfunc.matchWeekday("Lauantai"), 0)
  });
  it('Input string is an empty string', () => {
    assert.equal(dfunc.matchWeekday(""), 0)
  });
  it('Input string is longer than maximum input length', () => {
    assert.equal(dfunc.matchWeekday("asdfasdvaksjhva sasdf awehfiu va uih iuhsdfawef"), 0)
  });
  it('Typo of 1 letter', () => {
    assert.equal(dfunc.matchWeekday("Keskviikko"), 3)
  });
  it('Typo of 1 letter', () => {
    assert.equal(dfunc.matchWeekday("Perjanta"), 5)
  });
  it('Typo of 2 letters', () => {
    assert.equal(dfunc.matchWeekday("tistao"), 2)
  });
  it('Typo of 2 letters', () => {
    assert.equal(dfunc.matchWeekday("mananta"), 1)
  });
});

describe('Pretty Format Tests', () => {
  it('Normal weekday 1', () => {
    assert.equal(dfunc.toPrettyFormat("2021-10-13"), "Keskiviikko 13.10.")
  });
  it('Normal weekday 2', () => {
    assert.equal(dfunc.toPrettyFormat("2021-10-15"), "Perjantai 15.10.")
  });
  it('Saturday returns an empty string', () => {
    assert.equal(dfunc.toPrettyFormat("2021-10-16"), "")
  });
  it('Sunday returns an empty string', () => {
    assert.equal(dfunc.toPrettyFormat("2021-10-17"), "")
  });
});
