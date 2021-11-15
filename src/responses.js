const dfunc = require('./dateFunctions');

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
 * Turns a weekday into the finnish na-form.
 * @param {Luxon Date}
 */
const na = (date) => `${weekdays[date.weekday - 1]}na`;

/**
 * Turns a weekday into the finnish lta-form.
 * @param {Luxon Date}
 */
const lta = (date) => {
    if (date.weekday === 3) return 'keskiviikolta';
    return `${weekdays[date.weekday - 1]}lta`;
};

/**
 * Turns a weekday into the finnish sin-form.
 * @param {Luxon Date}
 */
const sin = (date) => {
    if (date.weekday === 3) return 'keskiviikkoisin';
    return `${weekdays[date.weekday - 1]}sin`;
};

/**
 * Turns a date into day.month.-form.
 * @param {Luxon Date}
 */
const dayPointMonth = (date) => `${date.day}.${date.month}.`;

/**
 * Convenience method for this commonly needed format.
 * @param {Luxon Date}
 */
const atDate = (date) => `${na(date)} ${dayPointMonth(date)}`;

/**
 * Reply to /listaa command.
 * @param {Luxon Date}
 * @param {List}
 */
const registrationList = (date, registrations) => {
    let response = `${atDate(date)} toimistolla`;
    let verb;
    if (dfunc.inThePast(date)) {
        if (registrations.length === 0) return `Kukaan ei ollut toimistolla ${atDate(date).toLowerCase()}`;
        verb = ' olivat\n';
        if (registrations.length === 1) verb = ' oli:\n';
    } else {
        if (registrations.length === 0) return `Kukaan ei ole toimistolla ${atDate(date).toLowerCase()}`;
        verb = ' ovat\n';
        if (registrations.length === 1) verb = ' on:\n';
    }
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
    const head = `Ilmoittautuminen lisätty - ${atDate(date).toLowerCase()}`;
    const tail = status === 'toimisto' ? ' toimistolla.' : ' etänä.';
    return head + tail;
};

/**
 * Reply to /ilmoita command with def parameter.
 * @param {Luxon Date}
 * @param {string}
 */
const defaultRegistrationAdded = (date, status) => {
    const head = `Oletusilmoittautuminen lisätty - ${sin(date).toLowerCase()}`;
    const tail = status === 'toimisto' ? ' toimistolla.' : ' etänä.';
    return head + tail;
};

/**
 * Reply to /poista command.
 * @param {Luxon Date}
 */
const normalRegistrationRemoved = (date) => `Ilmoittautuminen poistettu ${lta(date).toLowerCase()} ${dayPointMonth(date)}`;

/**
 * Reply to /poista command with def parameter.
 * @param {Luxon Date}
 */
const defaultRegistrationRemoved = (date) => `Oletusilmoittautuminen poistettu ${lta(date).toLowerCase()}.`;

/**
 * Explains allowed formats for day parameter in slash commands.
 */
const explainPäivä = () => '    • Maanantai\n'
    + '    • Ma\n'
    + '    • 15.11. tai 15.11\n'
    + '    • Tänään\n'
    + '    • Huomenna\n'
    + 'Isoilla ja pienillä kirjaimilla ei ole merkitystä.\n';

/**
 * Reply to /listaa command with help parameter.
 */
const explainListaa = () => `*/listaa*: Anna komennolle parametrina päivä jossain seuraavista muodoista:\n${explainPäivä()}`;

/**
 * Reply to /ilmoita command with help parameter.
 */
const explainIlmoita = () => '*/ilmoita*: '
    + 'Anna komennolle parametrina päivä ja status. Päivä annetaan jossain seuraavista muodoista:\n'
    + explainPäivä()
    + 'Status on joko *toimisto* tai *etä*.\n'
    + 'Antamalla parametrin *def* ennen muita parametreja, voit tehdä oletusilmoittautumisen.';

/**
 * Reply to /poista command with help parameter.
 */
const explainPoista = () => '*/poista*: '
    + 'Anna komennolle parametrina päivä jossain seuraavista muodoista:\n'
    + explainPäivä()
    + 'Antamalla parametrin *def* ennen muita parametreja, voit poistaa oletusilmoittautumisen.';

/**
 * Reply to user trying to add normal registration for weekend.
 * @param {Luxon Date}
 */
const denyNormalRegistrationForWeekend = () => 'Et voi lisätä ilmoittautumista viikonlopulle.';

/**
 * Reply to user trying to add default registration for weekend.
 * @param {Luxon Date}
 */
const denyDefaultRegistrationForWeekend = () => 'Et voi lisätä oletusilmoittautumista viikonlopulle.';

/**
 * Reply to /ilmoita command, if something goes wrong.
 * @param {Luxon Date}
 */
const demandDateAndStatus = () => 'Anna parametrina päivä ja status.';

/**
 * Reply to /listaa and /poista commands, if something goes wrong.
 * @param {Luxon Date}
 */
const demandDate = () => 'Anna parametrina päivä.';

module.exports = {
    defaultRegistrationAdded,
    defaultRegistrationRemoved,
    demandDate,
    demandDateAndStatus,
    denyDefaultRegistrationForWeekend,
    denyNormalRegistrationForWeekend,
    explainIlmoita,
    explainListaa,
    explainPoista,
    normalRegistrationAdded,
    normalRegistrationRemoved,
    registrationList,
};
