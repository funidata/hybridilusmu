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

const { enableActionFunctions } = require('./actionFunctions');
const { enableEventListeners } = require('./eventListeners');
const { enableMiddleware } = require('./middleware');
const { enableSlashCommands } = require('./slashCommands');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
});

enableActionFunctions(app);
enableEventListeners(app);
enableMiddleware(app);
enableSlashCommands(app);

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
