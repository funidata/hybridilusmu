require("./tools/timestampedLogger").replaceLoggers();
require("dotenv").config();
require("./tools/quotenv").checkEnv(["SLACK_BOT_TOKEN", "SLACK_APP_TOKEN", "SLACK_SIGNING_SECRET"]);
const { App } = require("@slack/bolt");
const scheduler = require("./scheduler/scheduler");
const usergroups = require("./usergroups");
const { enableActionFunctions } = require("./actionFunctions");
const { enableEventListeners } = require("./eventListeners");
const { enableUserCache } = require("./userCache");
const { enableMiddleware } = require("./middleware");
const { enableSlashCommands } = require("./slashCommands");
const { enableViewListeners } = require("./viewListeners");

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
enableViewListeners(state);
enableSlashCommands(state);

/**
 * Starts the bot.
 */
(async () => {
  await app.start();
  scheduler.startScheduling(state);
  scheduler.scheduleUsergroupReadings(state);
  console.log("⚡️ Bolt app is running!");
})();
