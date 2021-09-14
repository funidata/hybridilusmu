require('dotenv').config()
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

app.message('viikko', async({ message, say }) => {
  const weekdays = [
    'Maanantai',
    'Tiistai',
    'Keskiviikko',
    'Torstai',
    'Perjantai'
  ]

  const d = new Date()
  d.setDate(d.getDate()+(8-d.getDay()))

  for (const day of weekdays) {
    await say(`${day} ${d.getDate()}.${d.getMonth()+1}.`)
    d.setDate(d.getDate()+1)
  }
});

app.event('reaction_added', async ({ event, client }) => {
  console.log(`User <${event.user}> reacted`)
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();