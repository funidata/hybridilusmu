const logic = require('./logic');
const dfunc = require('./dateFunctions');
const { plain_text, mrkdwn } = require('./blocks/section')
const { header } = require('./blocks/header')
const { actions } = require('./blocks/actions')
const { divider } = require('./blocks/divider')
const { button } = require('./blocks/elements/button')

const SHOW_DAYS_UNTIL = 14

const update = async (client, userId) => {
  const date = new Date()
  const days = dfunc.listNWeekdays(date, SHOW_DAYS_UNTIL)
  let blocks = []

  blocks = blocks.concat(
    plain_text(`Tiedot päivitetty ${date.toLocaleString("fi-FI", { timeZone: 'Europe/Helsinki' })}`),
    actions([
      button('Päivitä', 'update_click', 'updated')
    ]),
    divider()
  )

  for (let i = 0; i < days.length; i++) {
    const d = days[i]

    blocks = blocks.concat(
      header(dfunc.fromISODatetoPrettyFormat(d))
    )
    const enrollments = await logic.getEnrollmentsFor(d)
    let usersString = enrollments.length === 0 ? "Kukaan ei ole ilmoittautunut toimistolle!" : "Toimistolla aikoo olla:\n"
    enrollments.forEach((user) => {
      usersString += `<@${user}>\n`
    })

    blocks = blocks.concat(
      mrkdwn(usersString),
      plain_text("Oma ilmoittautumiseni:"),
      actions([
        button('Toimistolla', 'toimistolla_click', d, `${await logic.userInOffice(userId, d) ? 'primary' : null}`),
        button('Etänä', 'etana_click', d, `${await logic.userIsRemote(userId, d) ? 'primary' : null}`)
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
