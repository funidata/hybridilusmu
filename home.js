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

const update = async (client, userId) => {
  const today = DateTime.now()
  const days = dfunc.listNWeekdays(today, SHOW_DAYS_UNTIL)
  let blocks = []
  
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

    blocks = blocks.concat(
      mrkdwn(usersString),
      plain_text("Oma ilmoittautumiseni:"),
      actions([
        button('Toimistolla', 'toimistolla_click', d, `${await service.userInOffice(userId, d) ? 'primary' : null}`),
        button('Etänä', 'etana_click', d, `${await service.userIsRemote(userId, d) ? 'primary' : null}`)
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
