const service = require('./databaseService');
const dfunc = require('./dateFunctions');
const { plain_text, mrkdwn } = require('./blocks/section')
const { header } = require('./blocks/header')
const { actions } = require('./blocks/actions')
const { divider } = require('./blocks/divider')
const { button } = require('./blocks/elements/button')
const { DateTime } = require("luxon");

const SHOW_DAYS_UNTIL = 10
const DAYS_IN_WEEK = 5;
const format = {...DateTime.DATETIME_MED, month: 'long' };

/**
 * Updates the App-Home page.
 */
const update = async (client, userId) => {
    let settings = await getSettingsPage(userId)
    let updateBlock = await getUpdateBlock()
    let enrollments = await getEnrollmentsPage(userId)
    let blocks = settings.concat(updateBlock, enrollments)
    client.views.publish({
        user_id: userId,
        view: {
            type:"home",
            blocks: blocks
        }
    })
}

const getSettingsPage = async (userId) => {
    let settingsPage = []
    settingsPage.push(mrkdwn("Oletusarvoisesti olen..."))
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
        const weekday = dfunc.weekdays[i]
        const buttonValue = {
            weekday: weekday,
            defaultInOffice: await service.userInOfficeByDefault(userId, weekday),
            defaultIsRemote: await service.userIsRemoteByDefault(userId, weekday)
        }
        settingsPage.push(
            mrkdwn("*" + weekday + "na*"),
            actions([
                button('Toimistolla', 'default_toimistolla', JSON.stringify(buttonValue), `${buttonValue.defaultInOffice ? 'primary' : null}`),
                button('Etänä', 'default_etana', JSON.stringify(buttonValue), `${buttonValue.defaultIsRemote ? 'primary' : null}`)
            ])
        )
    }
    return settingsPage
}

const getUpdateBlock = async () => {
    let updateBlock = []
    updateBlock.push(
        plain_text(`Tiedot päivitetty ${DateTime.now().setZone("Europe/Helsinki").setLocale('fi').toLocaleString(format)}`),
        actions([button('Päivitä', 'update_click', 'updated')]),
        divider()
    )
    return updateBlock
}

const getEnrollmentsPage = async (userId) => {
    let enrollmentsPage = []
    const dates = dfunc.listNWeekdays(DateTime.now(), SHOW_DAYS_UNTIL)
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i]
        enrollmentsPage.push(header(dfunc.toPrettyFormat(date)))
        const enrollments = await service.getEnrollmentsFor(date)
        let usersString = enrollments.length === 0 ? "Kukaan ei ole ilmoittautunut toimistolle!" : "Toimistolla aikoo olla:\n"
        enrollments.forEach((user) => {
            usersString += `<@${user}>\n`
        })
        const buttonValue = {
            date: date,
            inOffice: await service.userInOffice(userId, date),
            isRemote: await service.userIsRemote(userId, date)
        }
        enrollmentsPage.push(
            mrkdwn(usersString),
            plain_text("Oma ilmoittautumiseni:"),
            actions([
                button('Toimistolla', 'toimistolla_click', JSON.stringify(buttonValue), `${buttonValue.inOffice ? 'primary' : null}`),
                button('Etänä', 'etana_click', JSON.stringify(buttonValue), `${buttonValue.isRemote ? 'primary' : null}`)
            ]),
            divider()
        )
    }
    return enrollmentsPage
}

module.exports = { update }
