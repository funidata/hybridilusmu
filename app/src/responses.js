/* eslint-disable max-len */
const dfunc = require("./dateFunctions");
const { formatUserIdList } = require("./helperFunctions");
const { generateNameAndMention } = require("./userCache");

const weekdays = [
  "Maanantai",
  "Tiistai",
  "Keskiviikko",
  "Torstai",
  "Perjantai",
  "Lauantai",
  "Sunnuntai",
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
// eslint-disable-next-line no-unused-vars
const lta = (date) => {
  if (date.weekday === 3) return "keskiviikolta";
  return `${weekdays[date.weekday - 1]}lta`;
};

/**
 * Turns a weekday into the finnish sin-form.
 * @param {Luxon Date}
 */
// eslint-disable-next-line no-unused-vars
const sin = (date) => {
  if (date.weekday === 3) return "keskiviikkoisin";
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
  if (dfunc.isToday(date)) return "Tänään";
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
  if (dfunc.inThePast(date))
    return `Kukaan tiimistä ${usergroupMention} ei ollut toimistolla ${atDate(date).toLowerCase()}`;
  if (dfunc.isToday(date))
    return `Kukaan tiimistä ${usergroupMention} ei ole toimistolla ${atDate(date).toLowerCase()}.`;
  return `Kukaan tiimistä ${usergroupMention} ei ole toimistolla ${atDate(date).toLowerCase()}`;
};

/**
 * Returns the correct verb form based on tense and amount of people.
 * @param {Luxon Date}
 */
const correctVerbForm = (date, peopleCnt) => {
  let verb = "ovat";
  if (dfunc.inThePast(date)) {
    verb = peopleCnt === 1 ? "oli" : "olivat";
  } else {
    verb = peopleCnt === 1 ? "on" : "ovat";
  }
  return verb;
};

/**
 * Generates a plain text string message containing the date
 * and list of registrations.
 * @param {Luxon Date} date - Luxon Date object.
 * @param {List} registrations - List of user ID strings, usernames to be added to the response.
 * @param {*} [userFormatter] - Optional userFormatter, defaults to "Name (@Mention)"
 * @return {string} A message ready to post
 */
const registrationList = (date, registrations, userFormatter = generateNameAndMention) => {
  if (registrations.length === 0) return nobodyAtOffice(date);
  const verb = correctVerbForm(date, registrations.length);
  let response = `${atDate(date)} toimistolla ${verb}:\n`;
  registrations = formatUserIdList(registrations, userFormatter);
  for (const user of registrations) {
    response += `${user}\n`;
  }
  return response;
};

/**
 * Generates a plain thext string message containing the date
 * and a list of registrations within the given usergroup.
 * @param {Luxon Date} date - Luxon Date object.
 * @param {List} registrations - List of strings, usernames to be added to the response.
 * @param {string} usergroupMention - Usergroup mention string to be added to the response.
 * @param {*} [userFormatter] - Optional userFormatter, defaults to "Name (@Mention)"
 * @return {string} A message ready to post
 */
const registrationListWithUsergroup = (
  date,
  registrations,
  usergroupMention,
  userFormatter = generateNameAndMention,
) => {
  if (registrations.length === 0) return nobodyAtOfficeFromTeam(date, usergroupMention);
  const verb = correctVerbForm(date, registrations.length);
  let response = `${atDate(date)} tiimistä ${usergroupMention} ${verb} toimistolla:\n`;
  registrations = formatUserIdList(registrations, userFormatter);
  for (const user of registrations) {
    response += `${user}\n`;
  }
  return response;
};

/**
 * Response to /tilaa command.
 * @param {string} time
 * @param {Object} office
 */
const automatedMessageRescheduled = (time, office) =>
  `Ajastettu viesti tilattu kanavalle kello ${time}${
    office ? ` sisältäen toimiston '${office.officeName}' ilmoittautumiset.` : "."
  }`;

/**
 * Reply to /tilaa command with help parameter.
 */
const explainTilaa =
  () => `*/tilaa*: Anna komennolle parametrina kellonaika jossain seuraavista muodoista:
    • 13:37
    • 4.20
    • 07`;

/**
 * Reply when user has given a mention string but no usergroup matches.
 */
const usergroupNotFound = () => "Tarkista, että kirjoitit tiimin nimen oikein.";

/**
 * Reply to user trying to add normal registration for weekend.
 * @param {Luxon Date}
 */
const denyNormalRegistrationForWeekend = () => "Et voi lisätä ilmoittautumista viikonlopulle.";

/**
 * Reply to user trying to add default registration for weekend.
 * @param {Luxon Date}
 */
const denyDefaultRegistrationForWeekend = () =>
  "Et voi lisätä oletusilmoittautumista viikonlopulle.";

/**
 * Reply to /ilmoita command, if something goes wrong.
 * @param {Luxon Date}
 */
const demandDateAndStatus = () => "Anna parametreina päivä ja status (toimisto/etä).";

/**
 * Reply to /poista command, if something goes wrong.
 * @param {Luxon Date}
 */
const demandDate = () => "Anna parametrina päivä.";

/**
 * Reply to /listaa command, if something goes wrong.
 * @param {Luxon Date}
 */
const demandDateAndRemindAboutUGName = () =>
  "Anna parametrina päivä. Jos annoit tiimin nimen, tarkista että kirjoitit sen oikein.";

const demandTimeAndOffice = () =>
  "Anna parametrina ainakin kellonaika ja vapaaehtoisesti myös toimiston nimi.";

/**
 * Reply to /tilaa command, if something goes wrong.
 */
const demandTime = () => "Anna parametrina kelvollinen kellonaika.";

/**
 * Reply to /tilaa command, if office was not found with the given name.
 */
const noOfficeFound = (officeName) => `Ei löytynyt toimistoa nimellä: ${officeName}`;

/**
 * Reply when /tilaa command is given from bad channel
 */
const subscribeFailedNotInChannel = (channelName) =>
  `Automaattiviestien tilaaminen epäonnistui koska bottia ei ole lisätty kanavalle "${channelName}"`;

module.exports = {
  automatedMessageRescheduled,
  demandDate,
  demandDateAndStatus,
  demandDateAndRemindAboutUGName,
  demandTimeAndOffice,
  demandTime,
  noOfficeFound,
  denyDefaultRegistrationForWeekend,
  denyNormalRegistrationForWeekend,
  explainTilaa,
  registrationList,
  registrationListWithUsergroup,
  usergroupNotFound,
  subscribeFailedNotInChannel,
};
