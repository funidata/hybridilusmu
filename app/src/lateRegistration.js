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
  console.log('tultiin updateScheduledMessages')
  if (date !== DateTime.now().toISODate()) {
    console.log('did not click on todays registration, returning')
    return
  }
  console.log('begin updating scheduled messages')
  const jobs = await service.getAllJobs()
  const registrations = await service.getRegistrationsFor(date)
  console.log(jobs)
  for (const job of jobs) {
    const channelId = job.channelId
    const usergroupIds = usergroups.getUsergroupsForChannel(channelId)
    if (usergroupIds.length === 0) {
      console.log(`no user groups in channel: ${channelId}`)
      // Mikä tarkoittaa sitä, että kanavalla on vain yksi aikataulutettu viesti
      // Haetaan tietokannasta scheduledMessages taulusta messageId
      // SELECT messageId WHERE date, channelId
      const messageId = await service.getScheduledMessageId(date, channelId)
      return editRegistrations(app, registrations, channelId, messageId)
    } else {
      console.log(`found usergroups in channel: ${channelId}`)
      // Kanavalla voi olla monta aikataulutettua viestiä
      // Haetaan viestin id:t kannasta parametreillä
      // SELECT messageId WHERE date, channel, usegroupId
      usergroupIds.forEach(async (usergroupId) => {
        const messageId = service.getScheduledMessageId(date, channelId, usergroupId)
        const filteredRegistrations = registrations.filter(
          (userId) => usergroups.isUserInUsergroup(userId, usergroupId)
        )
        return editRegistrationsWithUsergroup(
          app, filteredRegistrations, channelId, messageId, usergroupId
        )
      })
    }
  }
}


module.exports = {
  updateScheduledMessages
}