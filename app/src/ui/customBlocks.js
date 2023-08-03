const { DateTime } = require("luxon");

const service = require("../databaseService");
const library = require("../responses");
const dfunc = require("../dateFunctions");
const { formatUserIdList, formatDates, formatOffice } = require("../helperFunctions");
const { generateNameAndMention, generatePlaintextString } = require("../userCache");

const { textInput } = require("./blocks/elements/textInput");
const { plainText, mrkdwn } = require("./blocks/section");
const { actions } = require("./blocks/actions");
const { context } = require("./blocks/context");
const { button } = require("./blocks/elements/button");
const { defaultSettingButton } = require("./blocks/elements/defaultSettingButton");
const { confirmation } = require("./blocks/elements/confirmation");
const { overflow } = require("./blocks/elements/overflow");
const { selectMenu } = require("./blocks/elements/selectMenu");
const { header } = require("./blocks/header");
const { divider } = require("./blocks/divider");

const DAYS_IN_WEEK = 5;
const SHOW_DAYS_UNTIL = 10;

const format = { ...DateTime.DATETIME_MED, month: "long" };

const sameOffice = (registration, office) => {
  return registration && registration.officeId === office.id;
};
const isAtOffice = (registration) => {
  return registration && registration.status;
};

/**
 * Creates and returns a block containing an update button used to update the Home tab
 * and a default settings button used to open the default settings modal.
 */
const getUpdateBlock = async (selectedOffice, isAdmin) => {
  const updateBlock = [];
  const overflowOptions = ["Toimistojen hallinta", "Lisää toimisto"];
  const actionElements = [button("Asetukset", "settings_click"), button("Päivitä", "update_click")];
  if (isAdmin) {
    actionElements.push(overflow(overflowOptions));
  }

  updateBlock.push(
    header(formatOffice(selectedOffice, true)),
    header(`ILMOITTAUTUMISET :spiral_calendar_pad:`),
    actions(actionElements),
    context(
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
const getDefaultSettingsBlock = async (userId, selectedOffice) => {
  const settingsBlock = [];
  if (!selectedOffice) {
    selectedOffice = await service.getDefaultOfficeForUser(userId);
  }
  const offices = await service.getAllOffices();
  settingsBlock.push(
    selectMenu("Valitse toimisto", offices, selectedOffice, "office_select", formatOffice),
    context(
      "Näet vain valitsemasi toimiston ilmoittautumiset, lisäksi kaikki valintasi rekisteröidään valitsemaasi toimistoon.",
    ),
    mrkdwn("Oletusarvoisesti olen..."),
  );
  const settings = await service.getDefaultSettingsForUser(userId);
  for (let i = 0; i < DAYS_IN_WEEK; i += 1) {
    const weekday = dfunc.weekdays[i];
    const registration = settings[weekday];
    const buttonValue = {
      weekday,
      officeId: selectedOffice.id,
      defaultAtOffice: isAtOffice(registration) && sameOffice(registration, selectedOffice),
      defaultIsRemote: !isAtOffice(registration) && sameOffice(registration, selectedOffice),
    };
    const { officeButtonColor, remoteButtonColor, emojis, confirm } = stylizeRegisterButtons(
      null,
      registration,
      selectedOffice,
    );

    if (weekday === "Keskiviikko") settingsBlock.push(mrkdwn(`*${weekday}isin*`));
    else settingsBlock.push(mrkdwn(`*${weekday}sin*`));
    settingsBlock.push(
      actions([
        defaultSettingButton(
          "Toimistolla",
          "default_office_click",
          JSON.stringify(buttonValue),
          officeButtonColor,
          emojis.officeEmoji,
          confirm,
        ),
        defaultSettingButton(
          "Etänä",
          "default_remote_click",
          JSON.stringify(buttonValue),
          remoteButtonColor,
          emojis.officeEmoji,
          confirm,
        ),
      ]),
    );
  }
  return settingsBlock;
};

/**
 * Handles the logic for providing the correct colors, emojis and confirmations for the
 * registration buttons. Green if registration is for the selected office, red if
 * a registration is for another office. There is also different emojis and confirmations
 * for normal registrations and default registrations.
 * @param {{}} registration A normal registration object for a given day.
 * @param {{}} defaultRegistration A default registration object for a given day.
 * @param {{}} selectedOffice Office object of the current office.
 * @returns {}
 */
const stylizeRegisterButtons = (registration, defaultRegistration, selectedOffice) => {
  let officeButtonColor = null;
  let remoteButtonColor = null;
  let emojis = { registrationEmoji: null, officeEmoji: null };
  let confirm = null;

  const setButtonColors = (registration, sameOffice, defaultReg) => {
    const confirmText = `Sinulla on jo ${
      defaultReg ? "oletusilmoittautuminen" : "ilmoittautuminen"
    } toimistolle ${registration.officeName}. Haluatko korvata sen?`;
    if (sameOffice) {
      officeButtonColor = isAtOffice(registration) ? "primary" : null;
      remoteButtonColor = isAtOffice(registration) ? null : "primary";
    } else {
      confirm = confirmation(confirmText);
      emojis.officeEmoji = registration.officeEmoji;
      officeButtonColor = isAtOffice(registration) ? "danger" : null;
      remoteButtonColor = isAtOffice(registration) ? null : "danger";
    }
  };

  if (registration) {
    emojis.registrationEmoji = "normal";
    setButtonColors(registration, sameOffice(registration, selectedOffice));
  } else if (defaultRegistration) {
    emojis.registrationEmoji = "default";
    setButtonColors(defaultRegistration, sameOffice(defaultRegistration, selectedOffice), true);
  }

  return { officeButtonColor, remoteButtonColor, emojis, confirm };
};

/**
 * Creates the registration list and registration buttons for a single
 * day inside the registrationsBlock.
 */
const getRegistrationListForDate = async (
  registrationsBlock,
  date,
  registrations,
  selectedOffice,
  userRegistrations,
  defaultSettings,
) => {
  registrationsBlock.push(header(dfunc.toPrettyFormat(date)));
  let userList = "";
  if (registrations[date].size === 0) {
    userList += "Kukaan ei ole ilmoittautunut toimistolle!";
  } else {
    userList += "Toimistolla aikoo olla:\n";
    const registrationList = formatUserIdList([...registrations[date]], generateNameAndMention);
    for (const user of registrationList) {
      userList += `${user}\n`;
    }
  }

  const weekday = dfunc.getWeekday(DateTime.fromISO(date));
  const registration = userRegistrations[date];
  const defaultRegistration = defaultSettings[weekday];

  const buttonValue = {
    date,
    officeId: selectedOffice.id,
    atOffice: isAtOffice(registration) && sameOffice(registration, selectedOffice),
    isRemote: !isAtOffice(registration) && sameOffice(registration, selectedOffice),
  };

  const { officeButtonColor, remoteButtonColor, emojis, confirm } = stylizeRegisterButtons(
    registration,
    defaultRegistration,
    selectedOffice,
  );

  registrationsBlock.push(
    mrkdwn(userList),
    plainText("Oma ilmoittautumiseni:\n"),
    actions([
      button(
        "Toimistolla",
        "office_click",
        JSON.stringify(buttonValue),
        officeButtonColor,
        emojis,
        confirm,
      ),
      button(
        "Etänä",
        "remote_click",
        JSON.stringify(buttonValue),
        remoteButtonColor,
        emojis,
        confirm,
      ),
    ]),
    divider(),
  );
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
    context("Voit myös perua ilmoittautumisen klikkaamalla painikkeista uudestaan."),
  );
  const dates = dfunc.listNWeekdays(DateTime.now(), SHOW_DAYS_UNTIL);
  const registrations = await service.getRegistrationsBetween(
    dates[0],
    dates[dates.length - 1],
    selectedOffice,
  );
  const defaultSettings = await service.getDefaultSettingsForUser(userId);
  const userRegistrations = await service.getRegistrationsForUserBetween(
    userId,
    dates[0],
    dates[dates.length - 1],
  );
  for (const date of dates) {
    getRegistrationListForDate(
      registrationsBlock,
      date,
      registrations,
      selectedOffice,
      userRegistrations,
      defaultSettings,
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
  const offices = (await service.getAllOffices()).map((office) => formatOffice(office));
  officeCreationBlock.push(
    mrkdwn("*Toimistot:*"),
    mrkdwn(offices.length > 0 ? offices.join("\n") : "n/a"),
    textInput("Toimiston nimi", "office_name_input"),
    textInput(
      "Toimiston emoji",
      "office_emoji_input",
      null,
      "Huom. myös custom- emojit toimivat, esim. :my_office:",
      true,
    ),
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
  officeControlBlock.push(divider());
  for (const office of offices) {
    const createdAt = formatDates(office.createdAt);
    const updatedAt = formatDates(office.updatedAt);
    officeControlBlock.push(
      header(formatOffice(office)),
      context(`_Luotu: ${createdAt}_\n_Muokattu: ${updatedAt}_`),
      actions([
        button("Muokkaa", "office_modify_click", `${office.id}`, "primary"),
        button(
          "Poista",
          "office_delete_click",
          `${office.id}`,
          "danger",
          null,
          confirmation(`Olet poistamassa toimistoa: ${office.officeName}`, "Poista", "danger"),
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
  const office = await service.getOffice(officeId);

  officeModifyBlock.push(
    header(formatOffice(office)),
    textInput("Toimiston nimi", "office_name_input", office.officeName),
    textInput(
      "Toimiston emoji",
      "office_emoji_input",
      office.officeEmoji,
      "Huom. myös custom- emojit toimivat, esim. :my_office:",
      true,
    ),
  );

  return officeModifyBlock;
};

/**
 * A limited view shown when there are no offices present.
 * This should only happen when all offices, including the default one, are
 * deleted.
 */
const getNoOfficesBlock = async (admin) => {
  const noOfficesBlock = [];
  if (!admin) {
    noOfficesBlock.push(plainText("Odota, että työtilan ylläpitäjä luo toimiston..."));
    return noOfficesBlock;
  }
  const overflowOptions = ["Toimistojen hallinta", "Lisää toimisto"];
  const actionElements = [button("Päivitä", "update_click", "updated"), overflow(overflowOptions)];
  noOfficesBlock.push(header("LUO TOIMISTO"), divider(), actions(actionElements), divider());

  return noOfficesBlock;
};

const getRegistrationsForTheDayBlock = (date, registrations, office) => {
  const registrationsforTheDayBlock = [];
  const registrationList = library.registrationList(
    date,
    registrations.map((registration) => registration.slackId),
    generatePlaintextString,
  );
  registrationsforTheDayBlock.push(
    header(formatOffice(office)),
    mrkdwn(registrationList),
    divider(),
    actions([button("Ilmoittaudu", "register_from_message")]),
  );

  return registrationsforTheDayBlock;
};

module.exports = {
  getUpdateBlock,
  getDefaultSettingsBlock,
  getRegistrationsBlock,
  getOfficeCreationBlock,
  getOfficeModifyBlock,
  getOfficeControlBlock,
  getNoOfficesBlock,
  stylizeRegisterButtons,
  getRegistrationsForTheDayBlock,
};
