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
const usergroups = require('./usergroups')
const { DateTime } = require("luxon");

/**
 * An optional prefix for our slash-commands. When set to e.g. 'h', '/listaa' becomes '/hlistaa'.
 * This requires manual command configuration on the Slack side of things, as in you must alter
 * the manifest for all the commands we have.
 */
const COMMAND_PREFIX = process.env.COMMAND_PREFIX ? process.env.COMMAND_PREFIX : ''

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


app.event('message', async({ event, say }) => {
  try {
    if (event.channel_type === "im" && event.text !== undefined) {
      const command = event.text.trim()
      const args = command.replaceAll('\t', ' ').split(' ').filter((str) => str.trim().length > 0)
      const date = dfunc.parseDate(args[0], DateTime.now())
      const usergroup_id = args.length === 2 ? usergroups.parseMentionString(args[1]) : false
      const usergroup_filter = !usergroup_id
        ? (uid) => true
        : (uid) => usergroups.isUserInUsergroup(uid, usergroup_id)
      if (date.isValid) {
        const enrollments = (
          await service.getRegistrationsFor(date.toISODate())
        ).filter(usergroup_filter)
        let response = !usergroup_id
          ? ""
          : `Tiimistä ${usergroups.generateMentionString(usergroup_id)} on paikalla:\n`
        if (enrollments.length === 0) {
          response = "Kukaan ei ole toimistolla tuona päivänä."
          if (usergroup_id) {
            response = `Kukaan tiimistä ${usergroups.generateMentionString(usergroup_id)} ei ole tuolloin toimistolla.`
          }
        }
        enrollments.forEach((user) => {
          response += `<@${user}>\n`
        })
        await say(response)
      } else {
        await say("Anteeksi, en ymmärtänyt äskeistä.")
      }
    }
  } catch (error) {
    console.log("Tapahtui virhe :(")
    console.log(error)
  }
});

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
app.command("/" + COMMAND_PREFIX + "listaa", async ({ command, ack, client }) => {
  try {
    await ack();
    let parameter = command.text //Antaa käskyn parametrin, eli kaiken mitä tulee slash-komennon ja ensimmäisen välilyönnin jälkeen
    const args = parameter.replaceAll('\t', ' ').split(' ').filter((str) => str.trim().length > 0)
    const date = dfunc.parseDate(args[0], DateTime.now())
    const usergroup_id = args.length === 2 ? usergroups.parseMentionString(args[1]) : false
    const usergroup_filter = !usergroup_id
      ? (uid) => true
      : (uid) => usergroups.isUserInUsergroup(uid, usergroup_id)
    if (date.isValid) {
      const registrations = (
        await service.getRegistrationsFor(date.toISODate())
      ).filter(usergroup_filter)
      let specifier = !usergroup_id
        ? ""
        : ` tiimistä ${usergroups.generateMentionString(usergroup_id)}`
      let predicate = registrations.length === 1 ? 'on' : 'ovat'
      let response = !usergroup_id
        ? `${dfunc.atWeekday(date)} toimistolla ${predicate}:`
        : `${dfunc.atWeekday(date)}${specifier} ${predicate} toimistolla:`
      if (registrations.length === 0) response = `Kukaan${specifier} ei ole toimistolla ${dfunc.atWeekday(date).toLowerCase()}`
      response += '\n'
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
  return user.user
}

/**
 * Get the restriction/guest value of the given user from Slack API.
 * @param {*} userId
 * @returns True if the user is restricted.
 */
async function getUserRestriction(userId) {
  const user = await getCachedUser(userId)
  // if we don't have a successful api call, default to restriction
  if (!user || user.is_restricted === undefined) {
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
      if (event !== undefined && (event.channel_type === 'channel' || event.channel_type === 'group')) { //Don't send the error message in this case
        return
      }
      const message = `Pahoittelut, <@${userId}>. Olet vieraskäyttäjä tässä Slack-työtilassa, joten et voi käyttää tätä bottia.`
      if (payload.command !== undefined) { // Responds to a slash-command with an ephemeral message.
        await ack();
        await client.chat.postEphemeral({
          channel: payload.channel_id,
          user: userId,
          text: message
        });
      } else if (payload.channel === undefined || payload.tab === 'home') { // Shows an error message on the home tab.
        home.error(client, userId, message);
      } else { // Responds to a private message with an ephemeral message.
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
 * Event listener for usergroup creation events
 */
app.event('subteam_created', async ({ event }) => {
  const id = event.subteam.id
  const type = event.type
  const ret = usergroups.processCreationEvent(event)
  const shorthand = usergroups.generatePlaintextString(id)
  console.log(`ug ${shorthand} <${id}>: ${type}, returning ${ret}`)
});
/**
 * Event listener for usergroup update events
 */
app.event('subteam_updated', async ({ event }) => {
  const id = event.subteam.id
  const type = event.type
  const ret = usergroups.processUpdateEvent(event)
  const shorthand = usergroups.generatePlaintextString(id)
  console.log(`ug ${shorthand} <${id}>: ${type}, returning ${ret}`)
  // The usergroup user-list state can be dirty after an update event,
  // as slack truncates the users-array to 500 elements.
  if (!ret) {
    console.log(`ug ${shorthand} <${id}> is dirty, refreshing users`)
    const users = await app.client.usergroups.users.list({ usergroup: id })
    const res = usergroups.insertUsergroupUsersFromAPIListResponse(users, id)
    if (!res) {
      console.log(`ug ${shorthand} <${id}> remains dirty after failed refresh`)
    }
  }
});
/**
 * Event listener for usergroup member change events
 */
app.event('subteam_members_changed', async ({ event }) => {
  const id = event.subteam_id
  const type = event.type
  const ret = usergroups.processMembersChangedEvent(event)
  const shorthand = usergroups.generatePlaintextString(id)
  console.log(`ug ${shorthand} <${id}>: ${type}, returning ${ret}`)
});

const readUsergroupsFromCleanSlate = async () => {
  let ugs = await app.client.usergroups.list()
  if (!ugs.ok) {
    console.log('Failed fetching usergroups')
    return
  }
  if (!ugs.usergroups || !ugs.usergroups.length) {
    console.log('No usergroups found')
    return
  }
  let usersOkay = usergroups.insertUsergroupsFromAPIListResponse(ugs)
  ugs.usergroups.forEach(async (ug) => {
    if (!ug.user_count || !usergroups.isDirty(ug.id)) {
      return
    }
    const users = await app.client.usergroups.users.list({ usergroup: ug.id })
    const res = usergroups.insertUsergroupUsersFromAPIListResponse(users, ug.id)
    if (!res) {
      console.log(`Something went awry when trying to insert usergroup users for usergroup ${ug.id}`)
    }
  })
};

const scheduleUsergroupReadings = async () => {
  const everyNight = new schedule.RecurrenceRule();
  everyNight.tz = 'Etc/UTC';
  everyNight.hour = 0
  everyNight.minute = 25
  console.log(`scheduling nightly usergroup reads at ${everyNight.hour}h ${everyNight.minute}m (${everyNight.tz})`)
  const job = schedule.scheduleJob(everyNight, readUsergroupsFromCleanSlate)
};

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
  console.log('⚡️ Bolt app is running!');
  startScheduling();
  readUsergroupsFromCleanSlate();
  scheduleUsergroupReadings();
})();

/**
 * Workaround for Node 14.x not crashing if our WebSocket disconnects and Bolt doesn't reconnect nicely.
 * See https://github.com/slackapi/node-slack-sdk/issues/1243.
 * We could specify node 16.x in our Dockerfile which would make that a crashing error.
*/
process.on("unhandledRejection", error => {
  throw error;
});
