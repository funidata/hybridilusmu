require('dotenv').config()
const { DateTime } = require("luxon");
const schedule = require('node-schedule');
const { App } = require('@slack/bolt');
const logic = require('./logic');
const dfunc = require('./dateFunctions');
const home = require('./home')
const db = require('./database');
const controller = require('./controllers/db.controllers');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

app.event('reaction_added', async ({ event, client }) => {
  console.log(`User <${event.user}> reacted`);
});

app.event('app_home_opened', async ({ event, client }) => {
  home.update(client, event.user);
});

app.action(`toimistolla_click`, async ({ body, ack, client}) => {
  await logic.toggleSignup(body.user.id, body.actions[0].value)
  home.update(client, body.user.id);
  await ack();
});

app.action(`etana_click`, async ({ body, ack, client}) => {
  await logic.toggleSignup(body.user.id, body.actions[0].value, false)
  home.update(client, body.user.id);
  await ack();
});

app.action(`update_click`, async ({ body, ack, client}) => {
  home.update(client, body.user.id);
  await ack();
});

app.event('message', async({ event, say }) => {
  console.log(DateTime.now().toString())
  if (event.channel_type === "im") {
    const date = dfunc.parseDate(event.text)
    if (date.isValid) {
      let response = ""
      const enrollments = await logic.getEnrollmentsFor(date.toISODate())
      if (enrollments.length === 0) response = "Kukaan ei ole toimistolla tuona päivänä."
      enrollments.forEach((user) => {
        response += `<@${user}>\n`
      })
      await say(response)
      console.log(DateTime.now().toString())
    } else {
      await say("Anteeksi, en ymmärtänyt äskeistä.")
      console.log(DateTime.now().toString())
    }
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  startScheduling();
  console.log('⚡️ Bolt app is running!');
})();

async function startScheduling() {
  const onceEverySunday = new schedule.RecurrenceRule();
  onceEverySunday.tz = 'Etc/UTC';
  onceEverySunday.dayOfWeek = 0
  onceEverySunday.hour = 10
  onceEverySunday.minute = 30
  console.log("scheduling posts to every public channel the bot is a member of on dayOfWeek",onceEverySunday.dayOfWeek,"at hour",onceEverySunday.hour,onceEverySunday.tz)
  const job = schedule.scheduleJob(onceEverySunday, () => {
    weekdays = dateFunctions.generateNextWeek(new Date())
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
