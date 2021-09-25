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

app.action('button_click', async ({ body, ack, say }) => {
  await ack();
  console.log('painettu')
});

app.event('app_home_opened', async ({ event, client }) => {
  const days = logic.generateNextWeek(new Date())
  let dayBlocks = []
  days.forEach(d => {
    app.action(`button_click_${d}`, async ({ body, ack, say }) => {
      await ack();
      console.log(`button_click_${d}`)
    });

    dayBlocks = dayBlocks.concat(
      {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": d
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
                "value": "click_me_123",
                "action_id": `button_click_${d}`
            }
        ]
      })
  })

  const blocks = dayBlocks
  
  client.views.publish({
    user_id: event.user,
    view: {
       type:"home",
       blocks: JSON.stringify(blocks)
    }
  })
});

const updateHome = async () => {
  
}

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
