const { DateTime } = require("luxon");

const service = require("../databaseService");
const dfunc = require("../dateFunctions");
const { formatUserIdList, formatDates } = require("../helperFunctions");
const { generateNameAndMention } = require("../userCache");

const { textInput } = require("./blocks/elements/textInput");
const { plainText, mrkdwn } = require("./blocks/section");
const { actions } = require("./blocks/actions");
const { button } = require("./blocks/elements/button");
const { confirmation } = require("./blocks/elements/confirmation");
const { overflow } = require("./blocks/elements/overflow");
const { header } = require("./blocks/header");
const { divider } = require("./blocks/divider");

const DAYS_IN_WEEK = 5;
const SHOW_DAYS_UNTIL = 10;

const format = { ...DateTime.DATETIME_MED, month: "long" };

/**
 * Creates and returns a block containing an update button used to update the Home tab
 * and a default settings button used to open the default settings modal.
 */
const getUpdateBlock = async (selectedOffice, offices, isAdmin) => {
  const updateBlock = [];
  const overflowOptions = ["Toimistojen hallinta", "Lisää toimisto"];
  const actionElements = [
    button("Oletusasetukset", "settings_click", "updated"),
    button("Päivitä", "update_click", "updated"),
  ];
  if (isAdmin) {
    actionElements.push(overflow(overflowOptions));
  }

  updateBlock.push(
    header(`ILMOITTAUTUMISET :spiral_calendar_pad:`),
    //header(`${selectedOffice.toUpperCase()} :cityscape:`),
    actions(actionElements),
    mrkdwn(
      `(_Tiedot päivitetty ${DateTime.now()
        .setZone("Europe/Helsinki")
        .setLocale("fi")
        .toLocaleString(format)}_)`,
    ),
    divider(),
  );
  return updateBlock;
};

/**
 * Creates and returns a block describing the default settings view.
 * This is then displayed on the default settings modal view.
 */
const getDefaultSettingsBlock = async (userId) => {
  const settingsBlock = [];
  settingsBlock.push(mrkdwn("Oletusarvoisesti olen..."));
  const settings = await service.getDefaultSettingsForUser(userId);
  for (let i = 0; i < DAYS_IN_WEEK; i += 1) {
    const weekday = dfunc.weekdays[i];
    const buttonValue = {
      weekday,
      defaultAtOffice: settings[weekday] === null ? false : settings[weekday],
      defaultIsRemote: settings[weekday] === null ? false : !settings[weekday],
    };
    if (weekday === "Keskiviikko") settingsBlock.push(mrkdwn(`*${weekday}isin*`));
    else settingsBlock.push(mrkdwn(`*${weekday}sin*`));
    settingsBlock.push(
      actions([
        button(
          "Toimistolla",
          "default_office_click",
          JSON.stringify(buttonValue),
          `${buttonValue.defaultAtOffice ? "primary" : null}`,
        ),
        button(
          "Etänä",
          "default_remote_click",
          JSON.stringify(buttonValue),
          `${buttonValue.defaultIsRemote ? "primary" : null}`,
        ),
      ]),
    );
  }
  return settingsBlock;
};

/**
 * Creates and returns a list of blocks containing the registrations to be displayed.
 * For every day there is a list of people registered for that day and buttons for user to register.
 */
const getRegistrationsBlock = async (userId, selectedOffice) => {
  const registrationsBlock = [];
  registrationsBlock.push(
    plainText(
      ":writing_hand: = Käsin tehty ilmoittautuminen   :robot_face: = Oletusilmoittautuminen\n",
    ),
  );
  registrationsBlock.push(plainText(selectedOffice));
  const dates = dfunc.listNWeekdays(DateTime.now(), SHOW_DAYS_UNTIL);
  const registrations = await service.getRegistrationsBetween(dates[0], dates[dates.length - 1]);
  const defaultSettings = await service.getDefaultSettingsForUser(userId);
  const userRegs = await service.getRegistrationsForUserBetween(
    userId,
    dates[0],
    dates[dates.length - 1],
  );
  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i];
    registrationsBlock.push(header(dfunc.toPrettyFormat(date)));
    let userList =
      registrations[date].size === 0
        ? "Kukaan ei ole ilmoittautunut toimistolle!"
        : "Toimistolla aikoo olla:\n";
    const registrationList = formatUserIdList([...registrations[date]], generateNameAndMention);
    for (const user of registrationList) {
      userList += `${user}\n`;
    }
    const weekday = dfunc.getWeekday(DateTime.fromISO(date));
    const buttonValue = {
      date,
      atOffice: userRegs[date] === null ? false : userRegs[date],
      isRemote: userRegs[date] === null ? false : !userRegs[date],
      atOfficeDefault: defaultSettings[weekday] === null ? false : defaultSettings[weekday],
      isRemoteDefault: defaultSettings[weekday] === null ? false : !defaultSettings[weekday],
    };
    let officeColor = `${buttonValue.atOfficeDefault ? "primary" : null}`;
    let remoteColor = `${buttonValue.isRemoteDefault ? "primary" : null}`;
    let emoji = "default";
    if (buttonValue.atOffice || buttonValue.isRemote) {
      officeColor = `${buttonValue.atOffice ? "primary" : null}`;
      remoteColor = `${buttonValue.isRemote ? "primary" : null}`;
      emoji = "normal";
    }
    registrationsBlock.push(
      mrkdwn(userList),
      plainText("Oma ilmoittautumiseni:"),
      actions([
        button("Toimistolla", "office_click", JSON.stringify(buttonValue), officeColor, emoji),
        button("Etänä", "remote_click", JSON.stringify(buttonValue), remoteColor, emoji),
      ]),
      divider(),
    );
  }
  return registrationsBlock;
};

/**
 * Creates and returns a block describing the office creation view.
 * This will be displayed inside the office creation modal.
 */
const getOfficeCreationBlock = async () => {
  const officeCreationBlock = [];
  const offices = (await service.getAllOffices()).map((office) => office.officeName);
  officeCreationBlock.push(
    mrkdwn("*Toimistot:*"),
    mrkdwn(offices.join("\n")),
    textInput("Lisää toimisto", "office_input"),
  );

  return officeCreationBlock;
};

/**
 * Creates and returns a block describing the office control view.
 * This will be displayed inside the office control modal.
 */
const getOfficeControlBlock = async () => {
  const officeControlBlock = [];
  const offices = await service.getAllOffices();
  officeControlBlock.push(mrkdwn("*Toimistot:*"), divider());
  for (const office of offices) {
    const createdAt = formatDates(office.createdAt);
    const updatedAt = formatDates(office.updatedAt);
    officeControlBlock.push(
      header(office.officeName),
      mrkdwn(`_Luotu: ${createdAt}_\n_Muokattu: ${updatedAt}_`),
      actions([
        button("Muokkaa", "office_modify_click", `${office.id}`, "primary"),
        button(
          "Poista",
          "office_delete_click",
          `${office.id}`,
          "danger",
          null,
          confirmation(
            "Varmastikko?",
            `Olet poistamassa toimistoa: ${office.officeName}`,
            "Poista",
            "danger",
          ),
        ),
      ]),
      divider(),
    );
  }

  return officeControlBlock;
};

/**
 * Creates and returns a block describing the office modifying view.
 * This is then displayed on the office modifying modal view.
 */
const getOfficeModifyBlock = async (officeId) => {
  const officeModifyBlock = [];
  const officeName = (await service.getOffice(officeId)).officeName;
  officeModifyBlock.push(
    header(officeName),
    textInput("Muokkaa toimiston nimeä", "office_input", officeName),
  );

  return officeModifyBlock;
};

/**
 * Show in place of registration block when there are no offices added yet.
 */
// TODO:
const getNoOfficesBlock = async () => {
  const noOfficesBlock = [];
  noOfficesBlock.push(plainText("Lisää toimisto rekisteröityäksesi"));
  return noOfficesBlock;
};

module.exports = {
  getUpdateBlock,
  getDefaultSettingsBlock,
  getRegistrationsBlock,
  getOfficeCreationBlock,
  getOfficeModifyBlock,
  getOfficeControlBlock,
  getNoOfficesBlock,
};
