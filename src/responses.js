/* eslint-disable max-len */
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
const atDate = (date) => {
    if (dfunc.isToday(date)) return 'Tänään';
    return `${na(date)} ${dayPointMonth(date)}`;
};

/**
 * Reply to no one being at the office.
 * @param {Luxon Date}
 */
const nobodyAtOffice = (date) => {
    if (dfunc.inThePast(date)) return `Kukaan ei ollut toimistolla ${atDate(date).toLowerCase()}`;
    if (dfunc.isToday(date)) return `Kukaan ei ole toimistolla ${atDate(date).toLowerCase()}.`;
    return `Kukaan ei ole toimistolla ${atDate(date).toLowerCase()}`;
};

/**
 * Reply to no one being at the office from the given usergroup.
 * @param {Luxon Date}
 */
const nobodyAtOfficeFromTeam = (date, usergroupMention) => {
    if (dfunc.inThePast(date)) return `Kukaan tiimistä ${usergroupMention} ei ollut toimistolla ${atDate(date).toLowerCase()}`;
    if (dfunc.isToday(date)) return `Kukaan tiimistä ${usergroupMention} ei ole toimistolla ${atDate(date).toLowerCase()}.`;
    return `Kukaan tiimistä ${usergroupMention} ei ole toimistolla ${atDate(date).toLowerCase()}`;
};

/**
 * Returns the correct verb form based on tense and amount of people.
 * @param {Luxon Date}
 */
const correctVerbForm = (date, peopleCnt) => {
    let verb = 'ovat';
    if (dfunc.inThePast(date)) {
        verb = peopleCnt === 1 ? 'oli' : 'olivat';
    } else {
        verb = peopleCnt === 1 ? 'on' : 'ovat';
    }
    return verb;
};

/**
 * Response to /listaa command.
 * @param {Luxon Date} date - Luxon Date object.
 * @param {List} registrations - List of strings, usernames to be added to the response.
 */
const registrationList = (date, registrations) => {
    if (registrations.length === 0) return nobodyAtOffice(date);
    const verb = correctVerbForm(date, registrations.length);
    let response = `${atDate(date)} toimistolla ${verb}:\n`;
    registrations.forEach((user) => {
        response += `<@${user}>\n`;
    });
    return response;
};

/**
 * Response to /listaa command with usergroup defined.
 * @param {Luxon Date} date - Luxon Date object.
 * @param {List} registrations - List of strings, usernames to be added to the response.
 * @param {string} usergroupMention - Usergroup mention string to be added to the response.
 * @return {string} A message ready to post
 */
const registrationListWithUsergroup = (date, registrations, usergroupMention) => {
    if (registrations.length === 0) return nobodyAtOfficeFromTeam(date, usergroupMention);
    const verb = correctVerbForm(date, registrations.length);
    let response = `${atDate(date)} tiimistä ${usergroupMention} ${verb} toimistolla:\n`;
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
 * Response to /tilaa command.
 * @param {string}
 */
const automatedMessageRescheduled = (time) => `Ajastettu viesti tilattu kanavalle kello ${time}`;

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
 * Reply to /tilaa command with help parameter.
 */
const explainTilaa = () => `*/tilaa*: Anna komennolle parametrina kellonaika jossain seuraavista muodoista:
    • 13:37
    • 4.20
    • 07`;

/**
 * Reply when user has given a mention string but no usergroup matches.
 */
const usergroupNotFound = () => 'Tarkista, että kirjoitit tiimin nimen oikein.';

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
 * Reply to /poista command, if something goes wrong.
 * @param {Luxon Date}
 */
const demandDate = () => 'Anna parametrina päivä.';

/**
 * Reply to /listaa command, if something goes wrong.
 * @param {Luxon Date}
 */
const demandDateAndRemindAboutUGName = () => 'Anna parametrina päivä. Jos annoit tiimin nimen, tarkista että kirjoitit sen oikein.';

/**
 * Reply to /tilaa command, if something goes wrong.
 */
const demandTime = () => 'Anna parametrina kellonaika.';

module.exports = {
    automatedMessageRescheduled,
    defaultRegistrationAdded,
    defaultRegistrationRemoved,
    demandDate,
    demandDateAndStatus,
    demandDateAndRemindAboutUGName,
    demandTime,
    denyDefaultRegistrationForWeekend,
    denyNormalRegistrationForWeekend,
    explainIlmoita,
    explainListaa,
    explainPoista,
    explainTilaa,
    normalRegistrationAdded,
    normalRegistrationRemoved,
    registrationList,
    registrationListWithUsergroup,
    usergroupNotFound,
};
