const { DateTime } = require('luxon');
const service = require('./databaseService');
const dfunc = require('./dateFunctions');
const { plain_text, mrkdwn } = require('./blocks/section');
const { header } = require('./blocks/header');
const { actions } = require('./blocks/actions');
const { divider } = require('./blocks/divider');
const { button } = require('./blocks/elements/button');

const SHOW_DAYS_UNTIL = 10;
const DAYS_IN_WEEK = 5;
const format = { ...DateTime.DATETIME_MED, month: 'long' };

/**
 * Updates the App-Home page.
 */
const update = async (client, userId) => {
    let blocks = [];
    blocks = blocks.concat(
        await getDefaultSettingsBlock(userId),
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

const getDefaultSettingsBlock = async (userId) => {
    const settingsBlock = [];
    settingsBlock.push(mrkdwn('Oletusarvoisesti olen...'));
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
        const weekday = dfunc.weekdays[i];
        const buttonValue = {
            weekday,
            defaultAtOffice: await service.userAtOfficeByDefault(userId, weekday),
            defaultIsRemote: await service.userIsRemoteByDefault(userId, weekday),
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

const getUpdateBlock = async () => {
    const updateBlock = [];
    updateBlock.push(
        plain_text(`Tiedot päivitetty ${DateTime.now().setZone('Europe/Helsinki').setLocale('fi').toLocaleString(format)}`),
        actions([button('Päivitä', 'update_click', 'updated')]),
        divider(),
    );
    return updateBlock;
};

const getRegistrationsBlock = async (userId) => {
    const registrationsBlock = [];
    const dates = dfunc.listNWeekdays(DateTime.now(), SHOW_DAYS_UNTIL);
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        registrationsBlock.push(header(dfunc.toPrettyFormat(date)));
        const registrations = await service.getRegistrationsFor(date);
        let userIdList = registrations.length === 0 ? 'Kukaan ei ole ilmoittautunut toimistolle!' : 'Toimistolla aikoo olla:\n';
        registrations.forEach((user) => {
            userIdList += `<@${user}>\n`;
        });
        const buttonValue = {
            date,
            atOffice: await service.userAtOffice(userId, date),
            isRemote: await service.userIsRemote(userId, date),
        };
        registrationsBlock.push(
            mrkdwn(userIdList),
            plain_text('Oma ilmoittautumiseni:'),
            actions([
                button('Toimistolla', 'office_click', JSON.stringify(buttonValue), `${buttonValue.atOffice ? 'primary' : null}`),
                button('Etänä', 'remote_click', JSON.stringify(buttonValue), `${buttonValue.isRemote ? 'primary' : null}`),
            ]),
            divider(),
        );
    }
    return registrationsBlock;
};

const error = async (client, userId, message) => {
    client.views.publish({
        user_id: userId,
        view: {
            type: 'home',
            blocks: [mrkdwn(message)],
        },
    });
};

module.exports = { update, error };
