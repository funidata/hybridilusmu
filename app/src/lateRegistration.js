const { DateTime } = require('luxon')
const service = require('./databaseService')
const library = require('./responses')
const usergroups = require('./usergroups')
const { editMessage } = require('./helperFunctions')
const { generatePlaintextString } = require('./userCache')

/**
 * Forms a new message containing the updated registrations and
 * then edits the given message in the given channel with the new
 * content.
 * @param {*} app Bolt app instance.
 * @param {List} registrations An array of Slack user ids.
 * @param {string} channelId Slack channel id.
 * @param {string} messageId Slack message id.
 * @returns The edited message object.
 */
const editRegistrations = async (app, registrations, channelId, messageId) => {
  const newMessage = library.registrationList(DateTime.now(), registrations, generatePlaintextString)
  return await editMessage(app, channelId, messageId, newMessage)
}

/**
 * Forms a new message containing the updated registrations including
 * the given usergroup and then edits the given message in the given
 * channel with the new content.
 * @param {*} app Bolt app instance.
 * @param {List} registrations An array of Slack user ids.
 * @param {string} channelId Slack channel id.
 * @param {string} messageId Slack message id.
 * @param {string} usergroupId Slack usergroup id.
 * @returns The edited message object.
 */
const editRegistrationsWithUsergroup = async (app, registrations, channelId, messageId, usergroupId) => {
  const newMessage = library.registrationListWithUsergroup(
    DateTime.now(),
    registrations,
    usergroups.generatePlaintextString(usergroupId),
    generatePlaintextString
    )
  return await editMessage(app, channelId, messageId, newMessage)
}

/**
 * Checks if there are any scheduled messages that have been sent on
 * the given date in any of the channels the bot has been added to
 * and performs necessary actions to update those messages.
 * @param {*} app Slack app instance.
 * @param {string} date Date string in the ISO date format.
 */
const updateScheduledMessages = async (app, date) => {
  if (date !== DateTime.now().toISODate()) {
    return
  }
  console.log('begin checking if scheduled messages need updating')
  const jobs = await service.getAllJobs()
  const registrations = await service.getRegistrationsFor(date)
  // Check every job/channel for scheduled messages for _today_
  for (const job of jobs) {
    const channelId = job.channelId
    const usergroupIds = usergroups.getUsergroupsForChannel(channelId)
    if (usergroupIds.length === 0) {
      const messageId = await service.getScheduledMessageId(date, channelId)
      if (messageId) {
        editRegistrations(app, registrations, channelId, messageId)
      }
    } else {
      for (const usergroupId of usergroupIds) {
        const messageId = await service.getScheduledMessageId(date, channelId, usergroupId)
        if (messageId) {
          const filteredRegistrations = registrations.filter(
            (userId) => usergroups.isUserInUsergroup(userId, usergroupId)
          )
          editRegistrationsWithUsergroup(
            app, filteredRegistrations, channelId, messageId, usergroupId
          )
        }
      }
    }
  }
}

module.exports = {
  updateScheduledMessages
}