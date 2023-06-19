const { DateTime } = require('luxon')
const service = require('./databaseService')
const library = require('./responses')
const usergroups = require('./usergroups')
const { editMessage } = require('./helperFunctions')
const { generatePlaintextString } = require('./userCache')

const editRegistrations = async (app, registrations, channelId, messageId) => {
  const newMessage = library.registrationList(DateTime.now(), registrations, generatePlaintextString)
  return await editMessage(app, channelId, messageId, newMessage)
}

const editRegistrationsWithUsergroup = async (app, registrations, channelId, messageId, usergroupId) => {
  const newMessage = library.registrationListWithUsergroup(
    DateTime.now(),
    registrations,
    usergroups.generatePlaintextString(usergroupId),
    generatePlaintextString
    )
  return await editMessage(app, channelId, messageId, newMessage)
}

const updateScheduledMessages = async (app, date) => {
  if (date !== DateTime.now().toISODate()) {
    return
  }
  console.log('begin updating scheduled messages')
  const jobs = await service.getAllJobs()
  const registrations = await service.getRegistrationsFor(date)
  for (const job of jobs) {
    const channelId = job.channelId
    const usergroupIds = usergroups.getUsergroupsForChannel(channelId)
    if (usergroupIds.length === 0) {
      console.log(`no user groups in channel: ${channelId}`)
      const messageId = await service.getScheduledMessageId(date, channelId)
      if (messageId) {
        editRegistrations(app, registrations, channelId, messageId)
      }
    } else {
      console.log(`found usergroups in channel: ${channelId}`)
      usergroupIds.forEach(async (usergroupId) => {
        const messageId = service.getScheduledMessageId(date, channelId, usergroupId)
        if (messageId) {
          const filteredRegistrations = registrations.filter(
            (userId) => usergroups.isUserInUsergroup(userId, usergroupId)
          )
          editRegistrationsWithUsergroup(
            app, filteredRegistrations, channelId, messageId, usergroupId
          )
        }
      })
    }
  }
}


module.exports = {
  updateScheduledMessages
}