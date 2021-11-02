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
const home = require('./home');
const db = require('./database');
const controller = require('./controllers/db.controllers');
const { DateTime } = require("luxon");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});


// BUTTON ACTION FUNCTIONS


/**
 * Updates the App-Home page for the specified user.
 */
app.action(`update_click`, async ({ body, ack, client }) => {
  home.update(client, body.user.id);
  await ack();
});

/**
 * Registers the user as present at the office for the selected day and updates the App-Home page.
 */
app.action(`office_click`, async ({ body, ack, client }) => {
  const data = JSON.parse(body.actions[0].value)
  await service.changeRegistration(body.user.id, data.date, !data.atOffice)
  home.update(client, body.user.id);
  await ack();
});

/**
 * Registers the user as not present at the office for the selected day and updates the App-Home page.
 */
app.action(`remote_click`, async ({ body, ack, client }) => {
  const data = JSON.parse(body.actions[0].value)
  await service.changeRegistration(body.user.id, data.date, !data.isRemote, false)
  home.update(client, body.user.id);
  await ack();
});

/**
 * Registers the user as present at the office by default for the selected day and updates the App-Home page.
 */
app.action('default_office_click', async ({ body, ack, client }) => {
  const data = JSON.parse(body.actions[0].value)
  await service.changeDefaultRegistration(body.user.id, data.weekday, !data.defaultAtOffice)
  home.update(client, body.user.id);
  await ack();
});

/**
 * Registers the user as not present at the office by default for the selected day and updates the App-Home page.
 */
app.action('default_remote_click', async ({ body, ack, client }) => {
  const data = JSON.parse(body.actions[0].value)
  await service.changeDefaultRegistration(body.user.id, data.weekday, !data.defaultIsRemote, false)
  home.update(client, body.user.id);
  await ack();
});


// EVENT LISTENERS


/**
 * Updates the App-Home page for the specified user when they click on the Home tab.
 */
app.event('app_home_opened', async ({ event, client }) => {
  home.update(client, event.user);
});


//SLASH-COMMANDS


/**
 * Listens to a slash-command and prints a list of people at the office on the given day.
 */
app.command("/listaa", async ({ command, ack, client }) => {
  try {
    await ack();
    let parameter = command.text //Antaa käskyn parametrin, eli kaiken mitä tulee slash-komennon ja ensimmäisen välilyönnin jälkeen
    const date = dfunc.parseDate(parameter, DateTime.now())
    if (date.isValid) {
      const registrations = await service.getRegistrationsFor(date.toISODate())
      let response = dfunc.atWeekday(date) + " toimistolla "
      if (registrations.length === 0) response = "Kukaan ei ole toimistolla " + dfunc.atWeekday(date).toLowerCase()
      else if (registrations.length === 1) response += "on:\n"
      else response += "ovat:\n"
      registrations.forEach((user) => {
        response += `<@${user}>\n`
      })
      postEphemeralMessage(command.channel_id, command.user_id, response)
    } else {
      postEphemeralMessage(command.channel_id, command.user_id, "Anteeksi, en ymmärtänyt äskeistä.")
    }
  } catch (error) {
    console.log("Tapahtui virhe :(")
    console.log(error)
  }
});


// OTHER APP FUNCTIONS

/**
 * Our user API object cache. Format is the following:
 * {
 *   <userId>: {
 *     user: {
 *       id: <userId>,
 *       real_name: "Matti Meikäläinen",
 *       is_restricted: false
 *     },
 *     date: <timestamp in milliseconds>
 *   },
 *   <userId>: { ... },
 *   ...
 * }
 */
let usercache = {};

/**
 * Try to cache our user data so that getUserRestriction() doesn't bump into rate limits
 * @param {*} userId
 * @returns {Object} The user object as originally returned by Slack
 */
async function getCachedUser(userId) {
  if (usercache[userId] && usercache[userId].date + 60000 > new Date().getTime()) {
    console.log(`cache hit for user ${userId}`)
    return usercache[userId].user
  }
  const user = await app.client.users.info({user: userId})
  // something went wrong
  if (!user.ok) {
    console.log(`users.info failed for uid ${userId}`)
    return null
  }
  // success
  console.log(`caching user ${userId}`)
  usercache[userId] = {
    user: user.user,
    date: new Date().getTime()
  }
  return user
}

/**
 * Get the restriction/guest value of the given user from Slack API.
 * @param {*} userId
 * @returns True if the user is restricted.
 */
async function getUserRestriction(userId) {
  const user = await getCachedUser(userId)
  // if we don't have a successful api call, default to restriction
  if (!user) {
    return true
  }
  return user.is_restricted
}

/**
 * Bolt global middleware (runs before every request) that checks if the user 
 * is a guest (restricted), and if so, stops further processing of the request, 
 * displaying an error message instead.
 */
async function guestHandler({ payload, body, client, next, ack, event }) {
  // The user ID is found in many different places depending on the type of action taken
  let userId // Undefined evaluates as false
  console.log(payload)
  if (!userId) try {userId = payload.user} catch (error) {} // tab
  if (!userId) try {userId = payload.user_id} catch (error) {} // slash command
  if (!userId) try {userId = body.user.id} catch (error) {} // button
  if (!userId) try {userId = body.event.message.user} catch (error) {} // message edit
  
  // Approve requests which don't include any of the above (couldn't find any)
  if (!userId) {
    console.log(`alert: guest check skipped!`)
    await next();
    return;
  }

  try {
    if (await getUserRestriction(userId)) {
      throw `User is restricted`;
    }
  } catch (error) {
    // This user is restricted. Show them an error message and don't continue processing the request
    if (error === 'User is restricted') {
      if (event.channel_type === 'channel') { //Don't send the error message in this case
        return
      }
      const message = `Pahoittelut, <@${userId}>. Olet vieraskäyttäjä tässä Slack-työtilassa, joten et voi käyttää tätä bottia.`
      if (payload.command !== undefined) { //Send an ephemeral message back to the channel where the slack command came from
        await ack();
        await client.chat.postEphemeral({
          channel: payload.channel_id,
          user: userId,
          text: message
        });
      } else if (payload.channel === undefined || payload.tab === 'home') {
        home.error(client, userId, message); // Home tab requests show the message on the home tab
      } else { // Otherwise send a private message
        await client.chat.postEphemeral({
          channel: payload.channel,
          user: userId,
          text: message
        });
      }
      return;
    }
    // Pass control to previous middleware (if any) or the global error handler
    throw error;
  }
  // Pass control to the next middleware (if there are any) and the listener functions
  // Note: You probably don't want to call this inside a `try` block, or any middleware
  //       after this one that throws will be caught by it. 
  await next();
}

app.use(guestHandler)

/**
 * Sends a scheduled message every Sunday to all the channels the bot is in.
 */
async function startScheduling() {
  const onceEverySunday = new schedule.RecurrenceRule()
  onceEverySunday.tz = 'Etc/UTC'
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
 * Posts an ephemeral message to the given user at the given channel.
 */
async function postEphemeralMessage(channelId, userId, text) {
  await app.client.chat.postEphemeral({
        channel: channelId,
        user: userId,
        text: text
      });
}

/**
 * Starts the bot.
 */
(async () => {
  await app.start(process.env.PORT || 3000);
  startScheduling();
  console.log('⚡️ Bolt app is running!');
})();

/** 
 * Workaround for Node 14.x not crashing if our WebSocket disconnects and Bolt doesn't reconnect nicely.
 * See https://github.com/slackapi/node-slack-sdk/issues/1243.
 * We could specify node 16.x in our Dockerfile which would make that a crashing error.
*/
process.on("unhandledRejection", error => {
  throw error;
});
