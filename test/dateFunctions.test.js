const assert = require('assert');
const dfunc = require('../dateFunctions');
const { DateTime } = require("luxon");

const RECORD_LIMIT = 180

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
    it('Normal case without a dot 1', () => {
        const today = DateTime.local(2021, 10, 11)
        assert.equal(dfunc.parseDate("14.10", today).toString(), 
                    DateTime.local(2021, 10, 14).toString())
    });
    it('Normal case without a dot 2', () => {
        const today = DateTime.local(2021, 10, 16)
        assert.equal(dfunc.parseDate("18.10", today).toString(), 
                    DateTime.local(2021, 10, 18).toString())
    });
    it('Normal case with a dot', () => {
        const today = DateTime.local(2021, 10, 7)
        assert.equal(dfunc.parseDate("21.10.", today).toString(), 
                    DateTime.local(2021, 10, 21).toString())
    });
    it('Normal case with a dot', () => {
        const today = DateTime.local(2021, 12, 8)
        assert.equal(dfunc.parseDate("14.12.", today).toString(), 
                    DateTime.local(2021, 12, 14).toString())
    });
    it('Asking far away into the future', () => {
        const today = DateTime.local(2021, 10, 1)
        assert.equal(dfunc.parseDate("3.12.", today).toString(), 
                    DateTime.local(2021, 12, 3).toString())
    });
    it('Asking even further away into the future', () => {
        const today = DateTime.local(2021, 10, 1)
        assert.equal(dfunc.parseDate("1.2.", today).toString(), 
                    DateTime.local(2022, 2, 1).toString())
    });
    it('Asking about the past', () => {
        const today = DateTime.local(2021, 10, 13)
        assert.equal(dfunc.parseDate("1.10.", today).toString(), 
                    DateTime.local(2021, 10, 1).toString())
    });
    it('Asking beyond the RECORD_LIMIT', () => {
        const today = DateTime.local(2021, 10, 13)
        const pastDay = today.minus({ days : (RECORD_LIMIT + 1) })
        const input = pastDay.day + "." + pastDay.month + "."
        assert.equal(dfunc.parseDate(input, today).toString(), 
                    pastDay.plus({ years : 1 }).toString())
    });
    it('Today', () => {
        const today = DateTime.local(2021, 10, 22)
        assert.equal(dfunc.parseDate("Tänään", today).toString(), 
                    DateTime.local(2021, 10, 22).toString())
    });
    it('Tomorrow', () => {
        const today = DateTime.local(2021, 10, 25)
        assert.equal(dfunc.parseDate("Huomenna", today).toString(), 
                    DateTime.local(2021, 10, 26).toString())
    });
    it('Tomorrow is weekend', () => {
        const today = DateTime.local(2021, 10, 22)
        assert.equal(dfunc.parseDate("Huomenna", today).toString(), 
                    DateTime.local(2021, 10, 23).toString())
    });
    it('Empty string', () => {
        assert.equal(dfunc.parseDate("", DateTime.now()).toString(), DateTime.fromObject({ day: 0 }).toString())
    });
    it('Input does not match regex 1', () => {
        assert.equal(dfunc.parseDate("asdasdasd", DateTime.now()).toString(), DateTime.fromObject({ day: 0 }).toString())
    });
    it('Input does not match regex 2', () => {
        assert.equal(dfunc.parseDate("1.1.2020", DateTime.now()).toString(), DateTime.fromObject({ day: 0 }).toString())
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
    it('Input string is weekend', () => {
        assert.equal(dfunc.matchWeekday("Lauantai"), 6)
    });
    it('Input string is not a weekday', () => {
        assert.equal(dfunc.matchWeekday("kurpitsa"), 0)
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
    it('Abbreviation of Maanantai', () => {
        assert.equal(dfunc.matchWeekday("Ma"), 1)
    });
    it('Abbreviation of Tiistai', () => {
        assert.equal(dfunc.matchWeekday("ti"), 2)
    });
    it('Abbreviation of Torsta', () => {
        assert.equal(dfunc.matchWeekday("To"), 4)
    });
});

describe('Pretty Format Tests', () => {
    it('Normal weekday 1', () => {
        assert.equal(dfunc.toPrettyFormat("2021-10-13"), "Keskiviikko 13.10.")
    });
    it('Normal weekday 2', () => {
        assert.equal(dfunc.toPrettyFormat("2021-10-15"), "Perjantai 15.10.")
    });
    it('Weekend 1, Saturday', () => {
        assert.equal(dfunc.toPrettyFormat("2021-10-16"), "Lauantai 16.10.")
    });
    it('Weekend 2, Sunday', () => {
        assert.equal(dfunc.toPrettyFormat("2021-10-17"), "Sunnuntai 17.10.")
    });
});

describe('Is Weekday Tests', () => {
    it('Monday', () => {
        assert.equal(dfunc.isWeekday(DateTime.local(2021, 10, 18)), true)
    });
    it('Wednesday', () => {
        assert.equal(dfunc.isWeekday(DateTime.local(2021, 10, 20)), true)
    });
    it('Saturday', () => {
        assert.equal(dfunc.isWeekday(DateTime.local(2021, 10, 30)), false)
    });
    it('Sunday', () => {
        assert.equal(dfunc.isWeekday(DateTime.local(2021, 11, 7)), false)
    });
    it('Invalid date', () => {
        assert.equal(dfunc.isWeekday(DateTime.local(2021, 13, 37)), false)
    });
});
