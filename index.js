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

app.message('schedule next', async({ message, say }) => {
  scheduleNextMessagesToAllMemberChannels()
});


(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();


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