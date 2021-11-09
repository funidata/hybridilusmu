const { DateTime } = require('luxon');

const weekdays = [
    'Maanantai',
    'Tiistai',
    'Keskiviikko',
    'Torstai',
    'Perjantai',
    'Lauantai',
    'Sunnuntai',
];
const shortWeekdays = [
    'Ma',
    'Ti',
    'Ke',
    'To',
    'Pe',
    'La',
    'Su',
];
const MAX_INPUT_LENGTH = 20;
const RECORD_LIMIT = 180;
const MAX_DIFFERENCE = 2;

/**
 * Transforms a string from YYYY-MM-DD format to "Weekday day.month." -format
 * @param {string} datestring - String in the format YYYY-MM-DD.
 */
const toPrettyFormat = (datestring) => {
    const parts = datestring.split('-');
    const newDate = DateTime.fromObject({ year: parts[0], month: parts[1], day: parts[2] });
    const res = `${weekdays[newDate.weekday - 1]} ${newDate.day}.${newDate.month}.`;
    return res;
};

/**
 * Lists n weekdays from given day onwards.
 * Returns a list of strings, where strings are weekdays in format YYYY-MM-DD,
 * starting from the given day.
 * @param {Luxon Date} day - Starting day as a Luxon Date object.
 * @param {number} n - How many weekdays are listed.
 */
const listNWeekdays = (day, n) => {
    const res = [];
    for (let i = 0; i < n; i += 1) {
        while (day.weekday >= 6) day = day.plus({ days: 1 }); // eslint-disable-line
        res.push(day.toISODate());
        day = day.plus({ days: 1 }); // eslint-disable-line
    }
    return res;
};

/**
 * Returns a list of strings representing one week,
 * starting from next monday calculated from the given day.
 * Strings are of format "Maanantai 11.10."
 * @param {Luxon Date} day - Starting day as a Luxon Date object.
 */
const listNextWeek = (day) => {
    const nextMonday = day.plus({ days: (8 - day.weekday) });
    const res = [];
    for (const line of listNWeekdays(nextMonday, 5)) {  // eslint-disable-line
        res.push(toPrettyFormat(line));
    }
    return res;
};

/**
 * Calculates and returns the edit distance of given strings.
 * @param {string} str1 - First string.
 * @param {string} str2 - Second string.
 */
const editDistance = (str1, str2) => {
    const a = str1.length;
    const b = str2.length;
    const dp = new Array(a + 1);
    for (let i = 0; i <= a; i += 1) dp[i] = new Array(b + 1);
    for (let i = 0; i <= a; i += 1) dp[i][0] = i;
    for (let i = 0; i <= b; i += 1) dp[0][i] = i;
    for (let i = 1; i <= a; i += 1) {
        for (let j = 1; j <= b; j += 1) {
            const c = (str1[i - 1] === str2[j - 1] ? 0 : 1);
            dp[i][j] = Math.min(dp[i][j - 1] + 1, dp[i - 1][j] + 1, dp[i - 1][j - 1] + c);
        }
    }
    return dp[a][b];
};

const isToday = (input) => {
    if (input.length > MAX_INPUT_LENGTH) return false;
    if (editDistance(input.toLowerCase(), 'tänään') <= MAX_DIFFERENCE) return true;
    return false;
};

const isTomorrow = (input) => {
    if (input.length > MAX_INPUT_LENGTH) return false;
    if (editDistance(input.toLowerCase(), 'huomenna') <= MAX_DIFFERENCE) return true;
    return false;
};

const isWeekday = (date) => {
    if (!date.isValid || date.weekday >= 6) return false;
    return true;
};

/**
 * Checks if the string represents a weekday.
 * Returns 0 if string is not a weekday, 1 if it matches "Maanantai", 2 for "Tiistai" etc.
 * Case is ignored and typos up to MAX_DIFFERENCE allowed.
 * @param {string} str - String to be matched.
 */
const matchWeekday = (str) => {
    if (str.length > MAX_INPUT_LENGTH) return 0; // Ei tehdä alla olevaa liian pitkille syötteille
    // Katsotaan vastaako merkkijono jotain lyhennettä
    for (let i = 0; i < shortWeekdays.length; i += 1) {
        if (str.toLowerCase() === shortWeekdays[i].toLowerCase()) return i + 1;
    }
    // Katsotaan, onko merkkijono tarpeeksi lähellä mitää viikonpäivää
    // ja jos on, palautetaan sen päivän numero
    const dist = new Array(weekdays.length);
    for (let i = 0; i < weekdays.length; i += 1) {
        dist[i] = [editDistance(str.toLowerCase(), weekdays[i].toLowerCase()), i];
    }
    dist.sort((a, b) => a[0] - b[0]);
    if (dist[0][0] <= MAX_DIFFERENCE) return dist[0][1] + 1;
    return 0; // Muuten palautetaan nolla
};

/**
 * Returns a Luxon Date-object representing the given string or a 0-day -object,
 * if the string is not of accepted format.
 * Accepted forms are:
 * Weekday, for example "Maanantai" (case is ignored)
 * Numeral.Numeral
 * Numeral.Numeral.
 * @param {string} input - String to be parsed.
 * @param {Luxon Date} today - Date that serves as the central date for calculation.
 */
const parseDate = (input, today) => {
    if (isToday(input)) return today;
    if (isTomorrow(input)) return today.plus({ days: 1 });
    const weekday = matchWeekday(input);
    if (weekday) {
        return today.plus({ days: (weekday + 7 - today.weekday) % 7 });
    }
    const regex = /^([0-9]+\.[0-9]+(\.)?)$/;
    if (!regex.test(input)) return DateTime.fromObject({ day: 0 });
    const pieces = input.split('.');
    let date = DateTime.fromObject({ month: pieces[1], day: pieces[0] });
    if (date < today.minus({ days: RECORD_LIMIT })) date = date.plus({ years: 1 });
    return date;
};

/**
 * Transforms a Luxon Date object to "Maanantaina 1.11." -format.
 * This is a helper function used in creating answers to slash commands.
 * @param {Luxon Date} date - Luxon Date object
 */
const atWeekday = (date) => `${weekdays[date.weekday - 1]}na ${date.day}.${date.month}.`;

module.exports = {
    atWeekday,
    isWeekday,
    listNWeekdays,
    listNextWeek,
    matchWeekday,
    parseDate,
    toPrettyFormat,
    weekdays,
};
