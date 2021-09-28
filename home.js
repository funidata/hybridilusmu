const logic = require('./logic');
const { plain_text, mrkdwn } = require('./blocks/section')
const { header } = require('./blocks/header')
const { actions } = require('./blocks/actions')
const { divider } = require('./blocks/divider')
const { button } = require('./blocks/elements/button')

const update = async (client, userId) => {
  const date = new Date()
  const days = logic.generateWeek(date)
  let dayBlocks = []

  dayBlocks = dayBlocks.concat(
    plain_text(`Tiedot päivitetty ${date.toLocaleString()}`),
    actions([
      button('Päivitä', 'update_click', 'updated')
    ]),
    divider()
  )

  days.forEach(d => {
    dayBlocks = dayBlocks.concat(
      header(d)
    )
    
    const enrollments = logic.getEnrollmentsFor(d)
    let usersString = enrollments.length === 0 ? "Kukaan ei ole ilmoittautunut toimistolle!" : "Toimistolla aikoo olla:\n"
    enrollments.forEach((user) => {
      usersString += `<@${user}>\n`
    })
    
    dayBlocks = dayBlocks.concat(
      mrkdwn(usersString),
      plain_text("Oma ilmoittautumiseni:"),
      actions([
        button('Toimistolla', 'toimistolla_click', d, `${logic.userInOffice(userId, d) ? 'primary' : null}`),
        button('Etänä', 'etana_click', d, `${logic.userIsRemote(userId, d) ? 'primary' : null}`) 
      ]),
      divider()
    )
  })

  const blocks = dayBlocks

  client.views.publish({
    user_id: userId,
    view: {
       type:"home",
       blocks: blocks
    }
  })
}

module.exports = { update }