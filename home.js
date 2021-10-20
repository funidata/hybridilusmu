const service = require('./databaseService');
const dfunc = require('./dateFunctions');
const { plain_text, mrkdwn } = require('./blocks/section')
const { header } = require('./blocks/header')
const { actions } = require('./blocks/actions')
const { divider } = require('./blocks/divider')
const { button } = require('./blocks/elements/button')
const { DateTime } = require("luxon");

const SHOW_DAYS_UNTIL = 10
const format = {...DateTime.DATETIME_MED, month: 'long' };

/**
 * Updates the App-Home page.
 */
const update = async (client, userId) => {
  const today = DateTime.now()
  const days = dfunc.listNWeekdays(today, SHOW_DAYS_UNTIL)
  let blocks = []

  blocks = blocks.concat(
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "Oletusarvoisesti olen..."
        }
    })
    for (let i = 0; i < 5; i++) {
        const weekday = dfunc.weekdays[i]

        const buttonValue = {
        weekday: weekday,
        defaultInOffice: await service.userInOfficeByDefault(userId, weekday),
        defaultIsRemote: await service.userIsRemoteByDefault(userId, weekday)
        }

        blocks = blocks.concat(
        mrkdwn("*" + weekday + "*"),
        actions([
            button('Toimistolla', 'default_toimistolla', JSON.stringify(buttonValue), `${buttonValue.defaultInOffice ? 'primary' : null}`),
            button('Etänä', 'default_etana', JSON.stringify(buttonValue), `${buttonValue.defaultIsRemote ? 'primary' : null}`)
        ])
        )
    }
  
  blocks = blocks.concat(
    plain_text(`Tiedot päivitetty ${today.setZone("Europe/Helsinki").setLocale('fi').toLocaleString(format)}`),
    actions([
      button('Päivitä', 'update_click', 'updated')
    ]),
    divider()
  )

  for (let i = 0; i < days.length; i++) {
    const d = days[i]

    blocks = blocks.concat(
      header(dfunc.toPrettyFormat(d))
    )
    const enrollments = await service.getEnrollmentsFor(d)
    let usersString = enrollments.length === 0 ? "Kukaan ei ole ilmoittautunut toimistolle!" : "Toimistolla aikoo olla:\n"
    enrollments.forEach((user) => {
      usersString += `<@${user}>\n`
    })

    const buttonValue = {
      date: d,
      inOffice: await service.userInOffice(userId, d),
      isRemote: await service.userIsRemote(userId, d)
    }

    blocks = blocks.concat(
      mrkdwn(usersString),
      plain_text("Oma ilmoittautumiseni:"),
      actions([
        button('Toimistolla', 'toimistolla_click', JSON.stringify(buttonValue), `${buttonValue.inOffice ? 'primary' : null}`),
        button('Etänä', 'etana_click', JSON.stringify(buttonValue), `${buttonValue.isRemote ? 'primary' : null}`)
      ]),
      divider()
    )
  }

  client.views.publish({
    user_id: userId,
    view: {
       type:"home",
       blocks: blocks
    }
  })
}

module.exports = { update }
