require('./tools/timestampedLogger').replaceLoggers();
require('dotenv').config();
require('./tools/quotenv').checkEnv([
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
const usergroups = require('./usergroups');
const { enableActionFunctions } = require('./actionFunctions');
const { enableEventListeners } = require('./eventListeners');
const { enableUserCache } = require('./userCache');
const { enableMiddleware } = require('./middleware');
const { enableSlashCommands } = require('./slashCommands');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
});

const state = {
    app,
    usergroups,
};

const userCache = enableUserCache(state);
state.userCache = userCache;

enableMiddleware(state);
enableActionFunctions(state);
enableEventListeners(state);
enableSlashCommands(state);

/**
 * Starts the bot.
 */
(async () => {
    await app.start(process.env.PORT || 3000);
    scheduler.startScheduling(app);
    scheduler.scheduleUsergroupReadings(app, usergroups);
    console.log('⚡️ Bolt app is running!');
})();

/**
 * Workaround so Node 14.x doesn't crash if our WebSocket disconnects and Bolt doesn't reconnect.
 * See https://github.com/slackapi/node-slack-sdk/issues/1243.
 * We could specify node 16.x in our Dockerfile which would make that a crashing error.
 */
process.on('unhandledRejection', (error) => {
    throw error;
});
