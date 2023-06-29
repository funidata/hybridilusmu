const { DateTime } = require("luxon");
const service = require("./databaseService");
const dfunc = require("./dateFunctions");
const { plainText, mrkdwn } = require("./blocks/section");
const { header } = require("./blocks/header");
const { actions } = require("./blocks/actions");
const { divider } = require("./blocks/divider");
const { button } = require("./blocks/elements/button");
const { selectMenu } = require("./blocks/elements/selectMenu");
const { formatUserIdList } = require("./helperFunctions");
const { generateNameAndMention } = require("./userCache");
const { textInput } = require("./blocks/elements/textInput");
const { overflow } = require("./blocks/elements/overflow");

const SHOW_DAYS_UNTIL = 10;
const DAYS_IN_WEEK = 5;
const format = { ...DateTime.DATETIME_MED, month: "long" };

const modals = new Map();

const officesModalView = {
  type: "modal",
  title: {
    type: "plain_text",
    text: "Toimistojen asetukset",
  },
  close: {
    type: "plain_text",
    text: "Eiku",
  },
  submit: {
    type: "plain_text",
    text: "Luo",
  },
};

/**
 * Defines the default settings modal's title
 * and what text is displayed as tooltip on the closing 'X' button.
 * These are basic attributes of the modal view.
 */
const modalView = {
  type: "modal",
  title: {
    type: "plain_text",
    text: "Oletusasetukset",
  },
  close: {
    type: "plain_text",
    text: "Sulje",
  },
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
 * Creates and returns a block describing the office creation view.
 * This is then displayed on the office creation modal view.
 */
const getOfficeCreationBlock = async (userId) => {
  const officeSettingsBlock = [];
  officeSettingsBlock.push(
    mrkdwn("Toimistot:"),
    mrkdwn("Helsinki\nTampere"),
    textInput("Lisää toimisto", "office_input"),
  );

  return officeSettingsBlock;
};

/**
 * Creates and returns a block containing an update button used to update the Home tab
 * and a default settings button used to open the default settings modal.
 */
const getUpdateBlock = async (selectedOffice, offices, isAdmin) => {
  const updateBlock = [];
  const overflowOptions = ["Toimistot", "Lisää toimisto"];
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
 * Creates and returns a list of blocks containing the registrations to be displayed.
 * For every day there is a list of people registered for that day and buttons for user to register.
 */
const getRegistrationsBlock = async (userId, selectedOffice) => {
  console.log(`registrationBlock, selectedOffice: ${selectedOffice}`);
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
 * Show in place of registration block when there are no offices added yet.
 */
const getNoOfficesBlock = async () => {
  const noOfficesBlock = [];
  noOfficesBlock.push(plainText("Lisää toimisto rekisteröityäksesi"));
  return noOfficesBlock;
};

/**
 * Updates the Home tab.
 */
const update = async (client, userId, userCache, selectedOffice) => {
  let blocks = [];
  const isAdmin = (await userCache.getCachedUser(userId)).is_admin;
  const offices = await service.getAllOffices();
  if (!selectedOffice) {
    selectedOffice = await service.getDefaultOfficeForUser(userId);
  }
  blocks = blocks.concat(await getUpdateBlock(selectedOffice, offices, isAdmin));
  if (offices.length === 0) {
    console.log("no offices found, push new view");
    blocks = blocks.concat(await getNoOfficesBlock());
  } else {
    blocks = blocks.concat(await getRegistrationsBlock(userId, selectedOffice));
  }
  client.views.publish({
    user_id: userId,
    view: {
      type: "home",
      blocks,
    },
  });
};

/**
 * Opens the office creation modal view.
 */
const openOfficeCreationView = async (client, userId, triggerId) => {
  const block = await getOfficeCreationBlock();
  const res = await client.views.open({
    trigger_id: triggerId,
    view: { ...officesModalView, blocks: block },
  });
  modals.set(userId, res.view.id);
};

/**
 * Opens a modal view.
 */
const openView = async (client, userId, triggerId) => {
  const block = await getDefaultSettingsBlock(userId);
  const res = await client.views.open({
    trigger_id: triggerId,
    view: { ...modalView, blocks: block },
  });

  modals.set(userId, res.view.id);
};

/**
 * Updates a modal view.
 */
const updateView = async (client, userId) => {
  const block = await getDefaultSettingsBlock(userId);
  await client.views.update({
    view_id: modals.get(userId),
    view: { ...modalView, blocks: block },
  });
};

/**
 * Displays an error page on the Home tab.
 */
const error = async (client, userId, message) => {
  client.views.publish({
    user_id: userId,
    view: {
      type: "home",
      blocks: [mrkdwn(message)],
    },
  });
};

module.exports = {
  error,
  getDefaultSettingsBlock,
  openView,
  update,
  updateView,
  openOfficesView: openOfficeCreationView,
};
