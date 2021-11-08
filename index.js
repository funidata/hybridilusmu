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
    'DB_PORT',
]);
const { App } = require('@slack/bolt');
const scheduler = require('./scheduleMessage');
const helper = require('./helperFunctions');
const home = require('./home');
const { enableActionFunctions } = require('./actionFunctions');
const { enableSlashCommands } = require('./slashCommands');
const { enableEventListeners } = require('./eventListeners');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
});

enableActionFunctions(app);
enableSlashCommands(app);
enableEventListeners(app);

app.use(guestHandler);

/**
* Bolt global middleware (runs before every request) that checks if the user
* is a guest (restricted), and if so, stops further processing of the request,
* displaying an error message instead.
*/
async function guestHandler({ payload, body, client, next, ack, event }) {
    // The user ID is found in many different places depending on the type of action taken
    let userId; // Undefined evaluates as false
    if (!userId) try { userId = payload.user; } catch (error) {} // tab
    if (!userId) try { userId = payload.user_id; } catch (error) {} // slash command
    if (!userId) try { userId = body.user.id; } catch (error) {} // button
    if (!userId) try { userId = body.event.message.user; } catch (error) {} // message edit
    // Approve requests which don't include any of the above (couldn't find any)
    if (!userId) {
        console.log('alert: guest check skipped!');
        await next();
        return;
    }
    try {
        if (await helper.getUserRestriction(app, userId)) {
            throw new Error('User is restricted');
        }
    } catch (error) {
    // This user is restricted. Show them an error message and don't continue processing the request
        if (error.message === 'User is restricted') {
            if (event !== undefined && (event.channel_type === 'channel' || event.channel_type === 'group')) { // Don't send the error message in this case
                return;
            }
            const message = `Pahoittelut, <@${userId}>. Olet vieraskäyttäjä tässä Slack-työtilassa, joten et voi käyttää tätä bottia.`;
            if (payload.command !== undefined) { // Responds to a slash-command
                await ack();
                helper.postEphemeralMessage(app, payload.channel_id, userId, message);
            } else if (payload.channel === undefined || payload.tab === 'home') { // Shows an error message on the home tab.
                home.error(client, userId, message);
            } else { // Responds to a private message with an ephemeral message.
                helper.postEphemeralMessage(app, payload.channel, userId, message);
            }
            return;
        }
        // Pass control to previous middleware (if any) or the global error handler
        throw error;
    }
    // Pass control to the next middleware (if there are any) and the listener functions
    // Note: You probably don't want to call this inside a `try` block, or any middleware
    // after this one that throws will be caught by it.
    await next();
}

/**
 * Starts the bot.
 */
(async () => {
    await app.start(process.env.PORT || 3000);
    scheduler.startScheduling(app);
    console.log('⚡️ Bolt app is running!');
})();

/**
 * Workaround for Node 14.x not crashing if our WebSocket disconnects
 * and Bolt doesn't reconnect nicely.
 * See https://github.com/slackapi/node-slack-sdk/issues/1243.
 * We could specify node 16.x in our Dockerfile which would make that a crashing error.
 */
process.on('unhandledRejection', (error) => {
    throw error;
});
