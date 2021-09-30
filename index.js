require('dotenv').config()
const { App } = require('@slack/bolt');
const logic = require('./logic');
const db = require('./database');
const controller = require('./controllers/db.controllers');

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

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
