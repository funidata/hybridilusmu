require('dotenv').config()
const schedule = require('node-schedule');
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

(async () => {
  await app.start(process.env.PORT || 3000);
  startScheduling();
  console.log('⚡️ Bolt app is running!');
})();

async function startScheduling() {
  const everySunday = new schedule.RecurrenceRule();
  everySunday.dayOfWeek = 0
  console.log("scheduling posts to every public channel the bot is a member of on dayOfWeek",everySunday.dayOfWeek)
  const job = schedule.scheduleJob(everySunday, () => {
    weekdays = logic.generateNextWeek(new Date())
    getMemberChannelIds().then((result) => result.forEach(id => {
      postMessage(id, weekdays[0])
        .then(() => postMessage(id, weekdays[1]))
        .then(() => postMessage(id, weekdays[2]))
        .then(() => postMessage(id, weekdays[3]))
        .then(() => postMessage(id, weekdays[4]))
    }))
  })
}

async function getMemberChannelIds() {
  return (await app.client.conversations.list()).channels
    .filter(c => c.is_member)
    .map(c => c.id)
}

async function postMessage(channelId, text) {
  await app.client.chat.postMessage({
    channel: channelId,
    text: text
  })
}
