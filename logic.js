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
  day = new Date(day)
  day.setDate(day.getDate() + daysUntilMonday(day))
  const result = []
  for (const weekday of weekdays) {
    result.push(`${weekday} ${day.getDate()}.${day.getMonth() + 1}.`)
    day.setDate(day.getDate() + 1)
  }
  return result
}

const generateDateTitle = (date) => {
  const parts = date.split('-')
  const newDate = new Date(parts[0], parts[1] -1, parts[2])
  const weekday = weekdays[newDate.getDay() -1]
  const res = `${weekday} ${newDate.getDate()}.${newDate.getMonth() +1}.`
  return res
}

const generateDaysStartingFrom = (day, n) => {
  const res = []
  const currDate = new Date(day)
  for (let i = 0; i < n; i++) {
    dayNumber = currDate.getDay();
    if (dayNumber === 6 || dayNumber === 0) {
      currDate.setDate(currDate.getDate() + 1)
      continue
    }
    const month = currDate.getMonth() < 9 ? 
        `0${currDate.getMonth() + 1}` : 
        `${currDate.getMonth() + 1}`
    const dayNum = currDate.getDate() < 10 ?
        `0${currDate.getDate()}`:
        `${currDate.getDate()}`
    res.push(`${currDate.getFullYear()}-${month}-${dayNum}`)
    currDate.setDate(currDate.getDate() + 1)
  }
  return res;
}

const getEnrollmentsFor = async (date) => {
  const slackIds = await db.getAllOfficeSignupsForADate(date)
  return slackIds
}

const toggleSignup = async (userId, date, atOffice = true) => {
  if (await userInOffice(userId, date, atOffice)) {
    await db.removeSignup(userId, date)
  } else {
    await db.addSignupForUser(userId, date, atOffice)
  }
}

const userInOffice = async (userId, date, atOffice = true) => {
  const enrollment = await db.getOfficeSignupForUserAndDate(userId, date)
  return enrollment && enrollment.at_office === atOffice
}

const userIsRemote = async (userId, date) => {
  return userInOffice(userId, date, false)
}

module.exports = {
  daysUntilMonday,
  generateNextWeek,
  generateDateTitle,
  generateDaysStartingFrom,
  getEnrollmentsFor,
  toggleSignup,
  userInOffice,
  userIsRemote
};
