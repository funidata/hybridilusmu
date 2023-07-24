const { DateTime } = require("luxon");

const library = require("../responses");
const helper = require("../helperFunctions");
const service = require("../databaseService");
const { generatePlaintextString } = require("../userCache");

/**
 * Sends the list of registered users to the given channel.
 * @param {*} app - Slack app instance.
 * @param {List} registrations - List of user id string.
 * @param {string} channelId - Slack channel id.
 * @param {string} date - Date string in the ISO date format.
 */
const postRegistrations = async (app, registrations, channelId, date) => {
  const messageWithoutMentions = library.registrationList(
    DateTime.now(),
    registrations,
    generatePlaintextString,
  );
  const messageId = (await helper.postMessage(app, channelId, messageWithoutMentions)).ts;
  if (messageId) {
    service.addScheduledMessage(messageId, date, channelId);
  }
};

/**
 * Sends the list of registered users within a usergroup to the given channel.
 * @param {*} app - Slack app instance.
 * @param {List} registrations - List of user id string.
 * @param {string} channelId - Slack channel id.
 * @param {*} usergroups - Usergroup functions.
 * @param {string} usergroupId - Id of the slack usergroup we want to include in the message.
 * @param {string} date - Date string in the ISO date format.
 */
const postRegistrationsWithUsergroup = async (
  app,
  registrations,
  channelId,
  usergroups,
  usergroupId,
  date,
) => {
  const messageWithoutMentions = library.registrationListWithUsergroup(
    DateTime.now(),
    registrations,
    usergroups.generatePlaintextString(usergroupId),
    generatePlaintextString,
  );
  const messageId = (await helper.postMessage(app, channelId, messageWithoutMentions)).ts;
  if (messageId) {
    service.addScheduledMessage(messageId, date, channelId, usergroupId);
  }
};

/**
 * Function which posts messages of the current days registered users
 * on the given channel. Checks if any Slack user groups are added on the channel
 * and posts separate messages for each.
 * @param {*} app - Slack app instance.
 * @param {string} channelId - ID of the channel where messages will be posted
 * @param {*} usergroups - usergroups cache instance
 * @param {*} userCache - userCache instance
 * @returns
 */
const sendScheduledMessage = async (app, channelId, officeId, usergroups) => {
  console.log("delivering scheduled posts");
  const date = DateTime.now().toISODate();
  const registrations = await service.getRegistrationsFor(date, officeId);

  const usergroupIds = usergroups.getUsergroupsForChannel(channelId);
  // No Slack user groups are added to this channel.
  // Send normal message containing everyone that is registered.
  if (usergroupIds.length === 0) {
    return postRegistrations(app, registrations, channelId, date);
  } else {
    // Send a separate list of registered users from each
    // Slack user group in this channel
    usergroupIds.forEach(async (usergroupId) => {
      const filteredRegistrations = registrations.filter((userId) =>
        usergroups.isUserInUsergroup(userId, usergroupId),
      );
      return postRegistrationsWithUsergroup(
        app,
        filteredRegistrations,
        channelId,
        usergroups,
        usergroupId,
        date,
      );
    });
  }
};

module.exports = {
  sendScheduledMessage,
};
