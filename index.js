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

// the new way using a scheduling library
async function startScheduling() {
  // doesn't work for private channels btw
  (await app.client.conversations.list()).channels
  .filter(c => c.is_member)
  .forEach(c => {
    const everySunday = new schedule.RecurrenceRule();
    everySunday.dayOfWeek = 0 // 0 means Sunday

    // for testing
    //everySunday.dayOfWeek = 6
    //everySunday.second = 40

    console.log("scheduling posts to channel", c.name, "on dayOfWeek",everySunday.dayOfWeek)
    weekdays = logic.generateNextWeek(new Date())
    const job = schedule.scheduleJob(everySunday, () => {
      // seems necessary to do something like this to post the weekdays in the same order
      postMessage(c.id, weekdays[0])
        .then(() => postMessage(c.id, weekdays[1]))
        .then(() => postMessage(c.id, weekdays[2]))
        .then(() => postMessage(c.id, weekdays[3]))
        .then(() => postMessage(c.id, weekdays[4]))
    })
  })
}

/* this could separated from the above and used right before posting the messages
async function updateChannelMembershipList() {
} */

async function postMessage(channelId, text) {
  await app.client.chat.postMessage({
    channel: channelId,
    text: text
  })
}



// the old way using the API method
/*
app.message('schedule next', async({ message, say }) => {
  scheduleNextMessagesToAllMemberChannels()
});

async function scheduleNextMessagesToAllMemberChannels() {
  const result = await app.client.conversations.list();
  const date = new Date();
  result.channels.forEach(channel => {
    if (channel.is_member) {
      console.log("member of channel", channel.name);

      // set the time to post at 00:00 next Sunday
      date.setDate(date.getDate() + logic.daysUntilMonday(date) - 1);
      date.setHours(0, 0, 0, 0);

      scheduleMessagesToOneChannel(channel.id, date);
    }
  })
  console.log("posting at ",date);
}

async function scheduleMessagesToOneChannel(channelId, date) {
  let i = 0
  for (const lineToPrint of logic.generateNextWeek(new Date())) {
    const result = await app.client.chat.scheduleMessage({
      channel: channelId,
      text: lineToPrint,
      post_at: date.getTime() / 1000 + i++ // incrementing seconds seems necessary to keep the weekdays in order
    });
    console.log(result);
  }
}
*/