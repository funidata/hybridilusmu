const logic = require('./logic');

const update = async (client, userId) => {
  const date = new Date()
  const days = logic.generateWeek(date)
  let dayBlocks = []

  dayBlocks = dayBlocks.concat(
    {
      "type": "section",
      "text": {
          "type": "plain_text",
          "text": `Tiedot päivitetty ${date.toLocaleString()}`
        }
    },
    {
      "type": "actions",
      "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Päivitä"
            },
            "value": "updated",
            "action_id": 'update_click'              
          }
      ]
    },
    {
      "type": "divider"
    }
  )

  days.forEach(d => {
    dayBlocks = dayBlocks.concat(
      {
        "type": "header",
        "text": {
            "type": "plain_text",
            "text": d
          }
      }
    )
    
    const enrollments = logic.getEnrollmentsFor(d)
    let usersString = enrollments.length === 0 ? "Kukaan ei ole ilmoittautunut toimistolle!" : "Toimistolla aikoo olla:\n"
    enrollments.forEach((user) => {
      usersString += `<@${user}>\n`
    })

    dayBlocks = dayBlocks.concat(
      {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": usersString
          }
      }
    )
    
    dayBlocks = dayBlocks.concat(
      {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "Oma ilmoittautumiseni:"
          }
      },
      {
        "type": "actions",
        "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Toimistolla"
              },
              "style": `${logic.userInOffice(userId, d) ? "danger" : "primary"}`,
              "value": d,
              "action_id": 'toimistolla_click'              
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Etänä"
              },
              "style": `${logic.userIsRemote(userId, d) ? "danger" : "primary"}`,
              "value": d,
              "action_id": 'etana_click'
          }
        ]
      },
      {
        "type": "divider"
      }
    )
  })

  const blocks = dayBlocks

  client.views.publish({
    user_id: userId,
    view: {
       type:"home",
       blocks: JSON.stringify(blocks)
    }
  })
}

module.exports = { update }