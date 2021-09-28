require('dotenv').config()
const moment = require('moment');
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

app.event('message', async({ event, say }) => {
  const dateStr = logic.formateDateString(event.text)
  if (moment(dateStr, "YYYY-MM-DD", true).isValid() && event.channel_type == "im") {
    const date = new Date(dateStr);
    for (const name of logic.getPeopleInOffice(date)) {
      await say(name)
    }
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
