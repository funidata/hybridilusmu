const dfunc = require('./dateFunctions');
const service = require('./databaseService');

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
 * Response to /listaa command.
 * Generates a listing message for a given date
 * @param {Luxon Date} date - Luxon Date object. If null:
 *  - please provide data via fetchedRegistrations
 *  - we'll also use a "today" string for rendering
 * @param {string} slackUsergroupId A Slack usergroup id, if any.
 * @param {*} fetchedRegistrations A ready set of registration data for perfomance reasons
 * @return {string} A message ready to post
 */
const registrationList = async (
    { usergroups },
    date,
    slackUsergroupId = null,
    fetchedRegistrations = null,
) => {
    const usergroupFilter = !slackUsergroupId
        ? () => true
        : (uid) => usergroups.isUserInUsergroup(uid, slackUsergroupId);
    const registrations = fetchedRegistrations || (
        await service.getRegistrationsFor(date.toISODate())
    ).filter(usergroupFilter);
    const specifier = !slackUsergroupId
        ? ''
        : ` tiimistä ${usergroups.generateMentionString(slackUsergroupId)}`;
    let predicate = 'ovat';
    if (dfunc.inThePast(date)) {
        predicate = registrations.length === 1 ? 'oli' : 'olivat';
    } else {
        predicate = registrations.length === 1 ? 'on' : 'ovat';
    }
    const dateInResponse = date ? atDate(date) : 'Tänään';
    let response = !slackUsergroupId
        ? `${dateInResponse} toimistolla ${predicate}:`
        : `${dateInResponse}${specifier} ${predicate} toimistolla:`;
    if (registrations.length === 0) {
        response = dfunc.inThePast(date)
            ? `Kukaan${specifier} ei ollut toimistolla ${dateInResponse.toLowerCase()}`
            : `Kukaan${specifier} ei ole toimistolla ${dateInResponse.toLowerCase()}`;
    }
    response += '\n';
    registrations.forEach((user) => {
        response += `<@${user}>\n`;
    });
    return response;
};

/**
 * Response to /ilmoita command.
 * @param {Luxon Date}
 * @param {string}
 */
const normalRegistrationAdded = (date, status) => {
    const head = `Ilmoittautuminen lisätty - ${atDate(date).toLowerCase()}`;
    const tail = status === 'toimisto' ? ' toimistolla.' : ' etänä.';
    return head + tail;
};

/**
 * Response to /ilmoita command with def parameter.
 * @param {Luxon Date}
 * @param {string}
 */
const defaultRegistrationAdded = (date, status) => {
    const head = `Oletusilmoittautuminen lisätty - ${sin(date).toLowerCase()}`;
    const tail = status === 'toimisto' ? ' toimistolla.' : ' etänä.';
    return head + tail;
};

/**
 * Response to /poista command.
 * @param {Luxon Date}
 */
const normalRegistrationRemoved = (date) => `Ilmoittautuminen poistettu ${lta(date).toLowerCase()} ${dayPointMonth(date)}`;

/**
 * Response to /poista command with def parameter.
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
    + 'Isoilla ja pienillä kirjaimilla ei ole merkitystä.';

/**
 * Reply to /listaa command with help parameter.
 */
const explainListaa = () => `*/listaa*: Anna komennolle parametrina päivä jossain seuraavista muodoista:
${explainPäivä()}
Mainitsemalla tiimin, voit rajata listauksen vain kyseisen tiimin jäseniin.`;

/**
 * Reply to /ilmoita command with help parameter.
 */
const explainIlmoita = () => `*/ilmoita*: Anna komennolle parametrina päivä ja status. Päivä annetaan jossain seuraavista muodoista:
${explainPäivä()}
Status on joko *toimisto* tai *etä*.
Antamalla parametrin *def* ennen muita parametreja, voit tehdä oletusilmoittautumisen.`;

/**
 * Reply to /poista command with help parameter.
 */
const explainPoista = () => `*/poista*: Anna komennolle parametrina päivä jossain seuraavista muodoista:
${explainPäivä()}
Antamalla parametrin *def* ennen muita parametreja, voit poistaa oletusilmoittautumisen.`;

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
const demandDateAndStatus = () => 'Anna parametreina päivä ja status (toimisto/etä).';

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
