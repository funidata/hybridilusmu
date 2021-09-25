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

(async () => {
  await app.start(process.env.PORT || 3000);
  startScheduling();
  console.log('⚡️ Bolt app is running!');
})();

async function startScheduling() {
  (await app.client.conversations.list()).channels
  .filter(c => c.is_member)
  .forEach(c => {
    const everySunday = new schedule.RecurrenceRule();
    everySunday.dayOfWeek = 0
    console.log("scheduling posts to channel", c.name, "on dayOfWeek",everySunday.dayOfWeek)
    weekdays = logic.generateNextWeek(new Date())
    const job = schedule.scheduleJob(everySunday, () => {
      postMessage(c.id, weekdays[0])
        .then(() => postMessage(c.id, weekdays[1]))
        .then(() => postMessage(c.id, weekdays[2]))
        .then(() => postMessage(c.id, weekdays[3]))
        .then(() => postMessage(c.id, weekdays[4]))
    })
  })
}

async function postMessage(channelId, text) {
  await app.client.chat.postMessage({
    channel: channelId,
    text: text
  })
}
