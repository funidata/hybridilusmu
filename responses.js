const weekdays = [
    'Maanantai',
    'Tiistai',
    'Keskiviikko',
    'Torstai',
    'Perjantai',
    'Lauantai',
    'Sunnuntai',
];

// All functions in this class return a string.

/**
 * Reply to /listaa command.
 * @param {Luxon Date}
 * @param {List}
 */
const registrationList = (date, registrations) => {
    if (registrations.length === 0) return 'Kukaan ei ole toimistolla ' + atDate(date).toLowerCase();
    let response = atDate(date) + ' toimistolla';
    let verb = ' ovat\n';
    if (registrations.length === 1) verb = ' on:\n';
    response += verb;
    registrations.forEach((user) => {
        response += `<@${user}>\n`;
    });
    return response;
};

/**
 * Reply to /ilmoita command.
 * @param {Luxon Date}
 * @param {string}
 */
const normalRegistrationAdded = (date, status) => {
    const head = 'Ilmoittautuminen lisätty - ' + atDate(date).toLowerCase();
    const tail = status === 'toimisto' ? ' toimistolla.' : ' etänä.';
    return head + tail;
};

/**
 * Reply to /ilmoita command with def parameter.
 * @param {Luxon Date}
 * @param {string}
 */
const defaultRegistrationAdded = (date, status) => {
    const head = 'Oletusilmoittautuminen lisätty - ' + sin(date).toLowerCase();
    const tail = status === 'toimisto' ? ' toimistolla.' : ' etänä.';
    return head + tail;
};

/**
 * Reply to /poista command.
 * @param {Luxon Date}
 */
const normalRegistrationRemoved = (date) => {
    return 'Ilmoittautuminen poistettu ' + lta(date).toLowerCase() + ' ' + dayPointMonth(date);
};

/**
 * Reply to /poista command with def parameter.
 * @param {Luxon Date}
 */
const defaultRegistrationRemoved = (date) => {
    return 'Oletusilmoittautuminen poistettu ' + lta(date).toLowerCase() + '.';
};

/**
 * Reply to user trying to add normal registration for weekend.
 * @param {Luxon Date}
 */
const denyNormalRegistrationForWeekend = () => {
    return 'Et voi lisätä ilmoittautumista viikonlopulle.';
};

/**
 * Reply to user trying to add default registration for weekend.
 * @param {Luxon Date}
 */
const denyDefaultRegistrationForWeekend = () => {
    return 'Et voi lisätä oletusilmoittautumista viikonlopulle.';
};

/**
 * Reply to /ilmoita command, if something goes wrong.
 * @param {Luxon Date}
 */
const demandDateAndStatus = () => {
    return 'Anna parametrina päivä ja status.';
};

/**
 * Reply to /listaa and /poista commands, if something goes wrong.
 * @param {Luxon Date}
 */
const demandDate = () => {
    return 'Anna parametrina päivä.';
};

/**
 * Convenience method for this commonly needed format.
 * @param {Luxon Date}
 */
const atDate = (date) => {
    return na(date) + ' ' + dayPointMonth(date);
};

/**
 * Turns a weekday into the finnish lta-form.
 * @param {Luxon Date}
 */
const lta = (date) => {
    if (date.weekday === 3) return 'keskiviikolta';
    return weekdays[date.weekday - 1] + 'lta';
};

/**
 * Turns a weekday into the finnish sin-form.
 * @param {Luxon Date}
 */
const sin = (date) => {
    if (date.weekday === 3) return 'keskiviikkoisin';
    return weekdays[date.weekday - 1] + 'sin';
};

/**
 * Turns a weekday into the finnish na-form.
 * @param {Luxon Date}
 */
const na = (date) => {
    return weekdays[date.weekday - 1] + 'na';
};

/**
 * Turns a date into day.month.-form.
 * @param {Luxon Date}
 */
const dayPointMonth = (date) => {
    return `${date.day}.${date.month}.`;
};

module.exports = {
    defaultRegistrationAdded,
    defaultRegistrationRemoved,
    demandDate,
    demandDateAndStatus,
    denyDefaultRegistrationForWeekend,
    denyNormalRegistrationForWeekend,
    normalRegistrationAdded,
    normalRegistrationRemoved,
    registrationList,
};
