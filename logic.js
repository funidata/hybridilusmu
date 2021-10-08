
const db = require('./controllers/db.controllers');
const { DateTime } = require("luxon");
const weekdays = [
    'Maanantai',
    'Tiistai',
    'Keskiviikko',
    'Torstai',
    'Perjantai'
  ]
const MAX_INPUT_LENGTH = 20
const RECORD_LIMIT = 180

const daysUntilMonday = day => day.getDay() === 0 ? 1 : 8 - day.getDay()

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

const parseDate = input => {
  weekday = matchWeekday(input)
  if (weekday != 0) {
    let date = DateTime.now()
    return date.plus({ days: (weekday + 7 - date.weekday)%7 })
  }
  const regex = /^([0-9]+\.[0-9]+(\.)?)$/
  if (!regex.test(input)) return DateTime.fromObject({ day: 0 })
  const pieces = input.split(".")
  let date = DateTime.fromObject({ month: pieces[1],  day: pieces[0] })
  let now = DateTime.now()
  if (date < now.minus({ days: RECORD_LIMIT })) date = date.plus({ years: 1 })
  return date
}

//returns 0 if no match, 1 if str matches monday, 2 for tuesday etc.
const matchWeekday = str => {
    if (str.length > MAX_INPUT_LENGTH) return 0
    dist = new Array(weekdays.length)
    for (let i = 0; i < weekdays.length; i++) {
        dist[i] = [editDistance(str.toLowerCase(), weekdays[i].toLowerCase()) , i]
    }
    dist.sort((a,b) => a[0]-b[0])
    if (dist[0][0] <= 3) return dist[0][1] + 1
    return 0
}

const editDistance = (str1, str2) => {
   a = str1.length
   b = str2.length
   dp = new Array(a+1)
   for (let i = 0; i <= a; i++) dp[i] = new Array(b+1)
   for (let i = 0; i <= a; i++) dp[i][0] = i
   for (let i = 0; i <= b; i++) dp[0][i] = i
   for (let i = 1; i <= a; i++) {
      for (let j = 1; j <= b; j++) {
        c = (str1[i-1] === str2[j-1] ? 0 : 1)
        dp[i][j] = Math.min(dp[i][j-1] + 1, dp[i-1][j] + 1, dp[i-1][j-1] + c)
      }
   }
   return dp[a][b]
}

const getPeopleInOffice = date => {
    const names = ["Jussikainen Pupu", "Missenen Misse", "Makkis"]
    return names
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
    var month = ''
    if (currDate.getMonth() < 9) {
      month = `0${currDate.getMonth() + 1}`
    } else {
       month = `${currDate.getMonth() + 1}`
    }
    var dayNum = ''
    if (currDate.getDate() < 10 ) {
      dayNum = `0${currDate.getDate()}`
    } else {
      dayNum = `${currDate.getDate()}`
    }
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
  editDistance,
  generateNextWeek,
  generateDateTitle,
  generateDaysStartingFrom,
  getEnrollmentsFor,
  getPeopleInOffice,
  matchWeekday,
  parseDate,
  setInOffice,
  setAsRemote,
  toggleSignup,
  userInOffice,
  userIsRemote
};
