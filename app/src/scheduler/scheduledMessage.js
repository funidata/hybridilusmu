const { DateTime } = require('luxon');

const library = require('../responses');
const helper = require('../helperFunctions');
const service = require('../databaseService');
const { generatePlaintextString } = require('../userCache')

/**
 * Sends the list of registered users to the given channel.
 * @param {*} app - Slack app instance.
 * @param {List} registrations - List of user id string.
 * @param {string} channelId - Slack channel id.
 */
const postRegistrations = async (app, registrations, channelId) => {
  const messageWithoutMentions = library.registrationList(
      DateTime.now(),
      registrations,
      generatePlaintextString
  );
  await helper.postMessage(app, channelId, messageWithoutMentions)
}

/**
 * Sends the list of registered users within a usergroup to the given channel.
 * @param {*} app - Slack app instance.
 * @param {List} registrations - List of user id string.
 * @param {string} channelId - Slack channel id.
 * @param {*} usergroups - Usergroup functions.
 * @param {string} usergroupId - Id of the slack usergroup we want to include in the message.
 */
const postRegistrationsWithUsergroup = async (
  app,
  registrations,
  channelId,
  usergroups,
  usergroupId
  ) => {
  const messageWithoutMentions = library.registrationListWithUsergroup(
      DateTime.now(),
      registrations,
      usergroups.generatePlaintextString(usergroupId),
      generatePlaintextString
  )
  await helper.postMessage(app, channelId, messageWithoutMentions)
}

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
const sendScheduledMessage = async (app, channelId, usergroups, userCache) => {
  console.log('delivering scheduled posts')
  const registrations = await service.getRegistrationsFor(DateTime.now().toISODate())
  // Freshen up user cache to provide data for string generation
  const userPromises = registrations.map((uid) => userCache.getCachedUser(uid))
  // Wait for said freshening up to finish before continuing with message generation.
  // Otherwise we can get empty strings for all our users, unless they've already used the application
  // during this particular execution of the application. (Trust me, it's happened to me.)
  await Promise.all(userPromises)

  const usergroupIds = usergroups.getUsergroupsForChannel(channelId)
  // No Slack user groups are added to this channel.
  // Send normal message containing everyone that is registered.
  if (usergroupIds.length === 0) {
      return postRegistrations(app, registrations, channelId)
  } else {
      // Send a separate list of registered users from each
      // Slack user group in this channel
      usergroupIds.forEach(async (usergroupId) => {
          const filteredRegistrations = registrations.filter(
              (userId) => usergroups.isUserInUsergroup(userId, usergroupId),
          );
          return postRegistrationsWithUsergroup(
            app,
            filteredRegistrations,
            channelId,
            usergroups,
            usergroupId
          )
      });
  }
}

module.exports = {
  sendScheduledMessage,
};