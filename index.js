require('dotenv').config()
const { App } = require('@slack/bolt');
const logic = require('./logic');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

app.message('viikko', async({ message, say }) => {
  for (const lineToPrint of logic.generateNextWeek(new Date())) {
      await say(lineToPrint)
  }
});

app.event('reaction_added', async ({ event, client }) => {
  console.log(`User <${event.user}> reacted`)
});

app.event('app_home_opened', async ({ event, client }) => {
  updateHome(client, event.user);
});

app.action(`toimistolla_click`, async ({ body, ack, client}) => {
  logic.setInOffice(body.user.id, body.actions[0].value)
  updateHome(client, body.user.id);
  await ack();
});

app.action(`etana_click`, async ({ body, ack, client}) => {
  logic.setAsRemote(body.user.id, body.actions[0].value)
  updateHome(client, body.user.id);
  await ack();
});

app.action(`update_click`, async ({ body, ack, client}) => {
  updateHome(client, body.user.id);
  await ack();
});

const updateHome = async (client, userId) => {
  const date = new Date()
  const days = logic.generateWeek(date)
  let dayBlocks = []

  dayBlocks = dayBlocks.concat(
    {
      "type": "section",
      "text": {
          "type": "plain_text",
          "text": `Tiedot päivitetty ${date.getDay()}.${date.getMonth()} klo ${date.getHours()}:${date.getMinutes()}`
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

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
