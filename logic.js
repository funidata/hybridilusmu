const db = require('./controllers/db.controllers');

const daysUntilMonday = day => day.getDay() === 0 ? 1 : 8 - day.getDay()

const weekdays = [
  'Maanantai',
  'Tiistai',
  'Keskiviikko',
  'Torstai',
  'Perjantai'
]


const generateNextWeek = day => {
  day.setDate(day.getDate() + daysUntilMonday(day))
  const result = []
  for (const weekday of weekdays) {
    result.push(`${weekday} ${day.getDate()}.${day.getMonth() + 1}.`)
    day.setDate(day.getDate() + 1)
  }
  return result
}

const generateWeek = (day) => {
  const res = []
  const currDate = new Date();
  for (let i = 0; i < 14; i++) {
    dayNumber = currDate.getDay();
    if (dayNumber === 6 || dayNumber === 0) {
      currDate.setDate(currDate.getDate() + 1)
      continue
    }
    res.push(`${currDate.getFullYear()}-${currDate.getMonth()}-${currDate.getDate() + 1}`)
    currDate.setDate(currDate.getDate() + 1)
  }
  return res;
}

const users = new Map();
generateWeek(new Date()).forEach(d => users.set(d, []))

const getEnrollmentsFor = async (date) => {
  const dbIds = await db.getAllOfficeSignupsForADate(date)
  console.log("dbIds:", dbIds)

  const slackIds = []

  for (let i = 0; i < dbIds.length; i++) {
    slackIds.push(await db.getSlackId(dbIds[i]))
  }

  console.log("slackIds for : ", date, slackIds)
  return slackIds
}

const setInOffice = async (userId, date) => {
  const user = {
    id: userId,
    real_name: "user1"
  }
  //await db.addUser(user)
  const id = await db.findUserId(userId)
  console.log(id)
  await db.addSignupForUser(id, date, true)
  //users.set(date, users.get(date).concat(userId))
}

const setAsRemote = (userId, date) => {
  users.set(date, users.get(date).filter(function(e){return e != userId}))
}

const userInOffice = async (userId, date) => {
  const enrollments = await db.getAllOfficeSignupsForAUser(await db.findUserId(userId))
  const is = enrollments.includes(date)
  console.log(is, date)
  return is
}

const userIsRemote = (userId, date) => {
  return false
}

module.exports = { daysUntilMonday, generateNextWeek, generateWeek, getEnrollmentsFor, setInOffice, setAsRemote, userInOffice, userIsRemote};
