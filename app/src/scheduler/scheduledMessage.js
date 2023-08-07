const { DateTime } = require("luxon");

const library = require("../responses");
const helper = require("../helperFunctions");
const service = require("../databaseService");
const { generatePlaintextString } = require("../userCache");
const {
  getRegistrationsForTheDayBlock,
  getRegistrationsForTheDayBlockWithUG,
} = require("../ui/customBlocks");

/**
 * Sends the list of registered users to the given channel.
 * @param {*} app - Slack app instance.
 * @param {List} registrations - List of user id string.
 * @param {string} channelId - Slack channel id.
 * @param {string} date - Date string in the ISO date format.
 */
const postRegistrations = async (app, registrations, channelId, date, officeId) => {
  const office = await service.getOffice(officeId);
  const registrationsBlock = getRegistrationsForTheDayBlock(date, registrations, office);
  const fallbackMessage = library.scheduledMessageNotificationMsg(office, registrations.length);
  const messageId = (
    await helper.postBlockMessage(app, channelId, fallbackMessage, registrationsBlock)
  ).ts;
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
  officeId,
) => {
  const office = await service.getOffice(officeId);
  const registrationsBlock = getRegistrationsForTheDayBlockWithUG(
    date,
    registrations,
    office,
    usergroups.generatePlaintextString(usergroupId),
    generatePlaintextString,
  );
  const fallbackMessage = library.scheduledMessageNotificationMsg(
    office,
    registrations.length,
    usergroups.generatePlaintextString(usergroupId),
  );
  const messageId = (
    await helper.postBlockMessage(app, channelId, fallbackMessage, registrationsBlock)
  ).ts;
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
 * @param {string} [officeId] - Optional ID of a office, will only include registrations
 *                              from this office, otherwise includes all.
 * @param {*} usergroups - usergroups cache instance
 */
const sendScheduledMessage = async (app, channelId, officeId, usergroups) => {
  console.log("delivering scheduled posts");
  const date = DateTime.now();
  const officeIds = [];
  officeId
    ? officeIds.push(officeId)
    : officeIds.push(...(await service.getAllOffices()).map((office) => office.id));
  // Send a separate message for each office if no office argument was given.
  for (officeId of officeIds) {
    const registrations = await service.getRegistrationsFor(date.toISODate(), officeId);

    const usergroupIds = usergroups.getUsergroupsForChannel(channelId);
    // No Slack user groups are added to this channel.
    // Send normal message containing everyone that is registered.
    if (usergroupIds.length === 0) {
      postRegistrations(app, registrations, channelId, date, officeId);
    } else {
      // Send a separate list of registered users from each
      // Slack user group in this channel
      usergroupIds.forEach(async (usergroupId) => {
        const filteredRegistrations = registrations.filter((userId) =>
          usergroups.isUserInUsergroup(userId, usergroupId),
        );
        postRegistrationsWithUsergroup(
          app,
          filteredRegistrations,
          channelId,
          usergroups,
          usergroupId,
          date,
          officeId,
        );
      });
    }
  }
};

module.exports = {
  sendScheduledMessage,
};
