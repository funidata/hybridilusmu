require('./timestampedLogger').replaceLoggers();
require('dotenv').config();
require('./quotenv').checkEnv([
  'SLACK_BOT_TOKEN',
  'SLACK_APP_TOKEN',
  'SLACK_SIGNING_SECRET',
  'DB_SCHEMA',
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
  'DB_PORT'
]);
const { App } = require('@slack/bolt');
const schedule = require('node-schedule');
const service = require('./databaseService');
const dfunc = require('./dateFunctions');
const home = require('./home')
const db = require('./database');
const controller = require('./controllers/db.controllers');
const { DateTime } = require("luxon");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// app.message('viikko', async({ message, say }) => {
//   for (const line of dfunc.listNextWeek(DateTime.now())) {
//       await say(line)
//   }
// });

/**
 * Prints the Slack user id of a user that reacts to a message on any channel, where the bot is.
 * Works also in private messages.
 */
app.event('reaction_added', async ({ event, client }) => {
  console.log(`User <${event.user}> reacted`);
});

/**
 * Updates the App-Home page for the specified user when they click on the Home tab.
 */
app.event('app_home_opened', async ({ event, client }) => {
  home.update(client, event.user);
});

/**
 * Marks the user present in the office for the selected day and updates the App-Home page.
 */
app.action(`toimistolla_click`, async ({ body, ack, client }) => {
  const data = JSON.parse(body.actions[0].value)
  await service.toggleSignup(body.user.id, data.date, !data.inOffice)
  home.update(client, body.user.id);
  await ack();
});

/**
 * Marks the user not present in the office for the selected day and updates the App-Home page.
 */
app.action(`etana_click`, async ({ body, ack, client }) => {
  const data = JSON.parse(body.actions[0].value)
  await service.toggleSignup(body.user.id, data.date, !data.isRemote, false)
  home.update(client, body.user.id);
  await ack();
});

/**
 * Updates the App-Home page for the specified user.
 */
app.action(`update_click`, async ({ body, ack, client }) => {
  home.update(client, body.user.id);
  await ack();
});

app.action('default_toimistolla', async ({ body, ack, client }) => {
  console.log("MIAUUUUUUUUUU1")
  const data = JSON.parse(body.actions[0].value)
  await service.toggleDefaultSignup(body.user.id, data.weekday, !data.defaultInOffice)
  home.update(client, body.user.id);
  await ack();
});

app.action('default_etana', async ({ body, ack, client }) => {
  console.log("MIAUUUUUUUUUU2")
  const data = JSON.parse(body.actions[0].value)
  await service.toggleDefaultSignup(body.user.id, data.weekday, !data.defaultIsRemote, false)
  home.update(client, body.user.id);
  await ack();
});

/**
 * Listens to a command in private messages and prints a list of people at the office on the given day.
 */
app.event('message', async({ event, say }) => {
  if (event.channel_type === "im" && event.text !== undefined) {
    const date = dfunc.parseDate(event.text, DateTime.now())
    if (date.isValid) {
      const enrollments = await service.getEnrollmentsFor(date.toISODate())
      let response = ""
      if (enrollments.length === 0) response = "Kukaan ei ole toimistolla tuona päivänä."
      enrollments.forEach((user) => {
        response += `<@${user}>\n`
      })
      await say(response)
    } else {
      await say("Anteeksi, en ymmärtänyt äskeistä.")
    }
  }
});

/**
 * Sends a scheduled message every Sunday to all the channels the bot is in.
 */
async function startScheduling() {
  const onceEverySunday = new schedule.RecurrenceRule();
  onceEverySunday.tz = 'Etc/UTC';
  onceEverySunday.dayOfWeek = 0
  onceEverySunday.hour = 10
  onceEverySunday.minute = 30
  console.log("scheduling posts to every public channel the bot is a member of on dayOfWeek",onceEverySunday.dayOfWeek,"at hour",onceEverySunday.hour,onceEverySunday.tz)
  const job = schedule.scheduleJob(onceEverySunday, () => {
    weekdays = dfunc.listNextWeek(DateTime.now())
    getMemberChannelIds().then((result) => result.forEach(id => {
      postMessage(id, weekdays[0])
        .then(() => postMessage(id, weekdays[1]))
        .then(() => postMessage(id, weekdays[2]))
        .then(() => postMessage(id, weekdays[3]))
        .then(() => postMessage(id, weekdays[4]))
    }))
  })
}

/**
 * Returns a list of all the channels the bot is a member of.
 */
async function getMemberChannelIds() {
  return (await app.client.conversations.list()).channels
    .filter(c => c.is_member)
    .map(c => c.id)
}

/**
 * Posts a message to the given channel.
 */
async function postMessage(channelId, text) {
  await app.client.chat.postMessage({
    channel: channelId,
    text: text
  })
}

/**
 * Starts the bot.
 */
(async () => {
  await app.start(process.env.PORT || 3000);
  startScheduling();
  console.log('⚡️ Bolt app is running!');
})();

// workaround for Node 14.x not crashing if our WebSocket
// disconnects and Bolt doesn't reconnect nicely
// see https://github.com/slackapi/node-slack-sdk/issues/1243
// we could specify node 16.x in our Dockerfile which would make that a crashing error
process.on("unhandledRejection", error => {
	throw error;
});
