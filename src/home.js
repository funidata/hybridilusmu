const { DateTime } = require('luxon');
const service = require('./databaseService');
const dfunc = require('./dateFunctions');
const { plainText, mrkdwn } = require('./blocks/section');
const { header } = require('./blocks/header');
const { actions } = require('./blocks/actions');
const { divider } = require('./blocks/divider');
const { button } = require('./blocks/elements/button');

const SHOW_DAYS_UNTIL = 10;
const DAYS_IN_WEEK = 5;
const format = { ...DateTime.DATETIME_MED, month: 'long' };

/**
 * Defines the default settings modal's title
 * and what text is displayed as tooltip on the closing 'X' button.
 * These are basic attributes of the modal view.
 */
const modalView = {
    type: 'modal',
    external_id: 'default_modal',
    title: {
        type: 'plain_text',
        text: 'Oletusasetukset',
    },
    close: {
        type: 'plain_text',
        text: 'Sulje',
    },
};

/**
 * Creates and returns a block describing the default settings view.
 * This is then displayed on the default settings modal view.
 */
const getDefaultSettingsBlock = async (userId) => {
    const settingsBlock = [];
    settingsBlock.push(mrkdwn('Oletusarvoisesti olen...'));
    for (let i = 0; i < DAYS_IN_WEEK; i += 1) {
        // Täällä tehdään tällä hetkellä !! 10 !! tietokantakutsua.
        // -> 1
        const weekday = dfunc.weekdays[i];
        const buttonValue = {
            weekday,
            defaultAtOffice: await service.userAtOfficeByDefault(userId, weekday), // eslint-disable-line
            defaultIsRemote: await service.userIsRemoteByDefault(userId, weekday), // eslint-disable-line
        };
        if (weekday === 'Keskiviikko') settingsBlock.push(mrkdwn(`*${weekday}isin*`));
        else settingsBlock.push(mrkdwn(`*${weekday}sin*`));
        settingsBlock.push(
            actions([
                button('Toimistolla', 'default_office_click', JSON.stringify(buttonValue), `${buttonValue.defaultAtOffice ? 'primary' : null}`),
                button('Etänä', 'default_remote_click', JSON.stringify(buttonValue), `${buttonValue.defaultIsRemote ? 'primary' : null}`),
            ]),
        );
    }
    return settingsBlock;
};

/**
 * Creates and returns a block containing an update button used to update the Home tab
 * and a default settings button used to open the default settings modal.
 */
const getUpdateBlock = async () => {
    const updateBlock = [];
    updateBlock.push(
        header('ILMOITTAUTUMISET :spiral_calendar_pad:'),
        actions([
            button('Oletusasetukset', 'settings_click', 'updated'),
            button('Päivitä', 'update_click', 'updated'),
        ]),
        mrkdwn(`(_Tiedot päivitetty ${DateTime.now().setZone('Europe/Helsinki').setLocale('fi').toLocaleString(format)}_)`),
        divider(),
    );
    return updateBlock;
};

/**
 * Creates and returns a list of blocks containing the registrations to be displayed.
 * For every day there is a list of people registered for that day and buttons for user to register.
 */
const getRegistrationsBlock = async (userId) => {
    // Täällä tehdään tällä hetkellä !! 70 !! tietokantakutsua
    // -> 2
    const registrationsBlock = [];
    registrationsBlock.push(plainText(':writing_hand: = Käsin tehty ilmoittautuminen   :robot_face: = Oletusilmoittautuminen\n'));
    const dates = dfunc.listNWeekdays(DateTime.now(), SHOW_DAYS_UNTIL);
    for (let i = 0; i < dates.length; i += 1) {
        const date = dates[i];
        registrationsBlock.push(header(dfunc.toPrettyFormat(date)));
        const registrations = await service.getRegistrationsFor(date); // eslint-disable-line
        let userIdList = registrations.length === 0 ? 'Kukaan ei ole ilmoittautunut toimistolle!' : 'Toimistolla aikoo olla:\n';
        registrations.forEach((user) => {
            userIdList += `<@${user}>\n`;
        });
        const buttonValue = {
            date,
            atOffice: await service.userAtOffice(userId, date), // eslint-disable-line
            isRemote: await service.userIsRemote(userId, date), // eslint-disable-line
            atOfficeDefault: await service.userAtOfficeByDefault(userId, dfunc.getWeekday(DateTime.fromISO(date))), // eslint-disable-line
            isRemoteDefault: await service.userIsRemoteByDefault(userId, dfunc.getWeekday(DateTime.fromISO(date))), // eslint-disable-line
        };
        let officeColor = `${buttonValue.atOfficeDefault ? 'primary' : null}`;
        let remoteColor = `${buttonValue.isRemoteDefault ? 'primary' : null}`;
        let emoji = 'default';
        if (buttonValue.atOffice || buttonValue.isRemote) {
            officeColor = `${buttonValue.atOffice ? 'primary' : null}`;
            remoteColor = `${buttonValue.isRemote ? 'primary' : null}`;
            emoji = 'normal';
        }
        registrationsBlock.push(
            mrkdwn(userIdList),
            plainText('Oma ilmoittautumiseni:'),
            actions([
                button('Toimistolla', 'office_click', JSON.stringify(buttonValue), officeColor, emoji),
                button('Etänä', 'remote_click', JSON.stringify(buttonValue), remoteColor, emoji),
            ]),
        );
    }
    return registrationsBlock;
};

/**
 * Updates the Home tab.
 */
const update = async (client, userId) => {
    let blocks = [];
    blocks = blocks.concat(
        await getUpdateBlock(),
        await getRegistrationsBlock(userId),
    );
    client.views.publish({
        user_id: userId,
        view: {
            type: 'home',
            blocks,
        },
    });
};

/**
 * Opens a modal view.
 */
const openView = async (client, userId, triggerId) => {
    const block = await getDefaultSettingsBlock(userId);
    await client.views.open({
        trigger_id: triggerId,
        view: { ...modalView, blocks: block },
    });
};

/**
 * Updates a modal view.
 */
const updateView = async (client, userId) => {
    const block = await getDefaultSettingsBlock(userId);
    await client.views.update({
        external_id: 'default_modal',
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
            type: 'home',
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
};
