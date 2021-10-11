
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
const MAX_DIFFERENCE = 2

/*
 * Returns the number of days until next monday, starting from given day.
 * @day JavaScript Date object
 */
const daysUntilMonday = day => day.getDay() === 0 ? 1 : 8 - day.getDay()

/*
 * Returns a list of strings representing one week, starting from next monday, calculated from the given date.
 * Strings are of format "Maanantai 11.10."
 * @day (in some acceptable format)
 */
const generateNextWeek = date => {
  const day = new Date(date)
  day.setDate(day.getDate() + daysUntilMonday(day))
  const result = []
  for (const weekday of weekdays) {
    result.push(`${weekday} ${day.getDate()}.${day.getMonth() + 1}.`)
    day.setDate(day.getDate() + 1)
  }
  return result
}

/*
 * Lists n weekdays from given day onwards.
 * Returns a list of strings, where strings are weekdays in format YYYY-MM-DD, starting from the given day.
 * @day First day (in some acceptable format)
 * @n How many weekdays are listed
 */
const listNWeekdays = (day, n) => {
  const res = []
  const currDate = new Date(day)
  for (let i = 0; i < n; i++) {
    dayNumber = currDate.getDay();
    if (dayNumber === 6 || dayNumber === 0) {
      currDate.setDate(currDate.getDate() + 1)
      continue
    }
    res.push(toISODate(currDate))
    currDate.setDate(currDate.getDate() + 1)
  }
  return res;
}

/* 
 * Returns a Luxon Date-object representing the given string or a 0-day -object, if the string is not of accepted format.
 * Accepted forms are:
 * Weekday, for example "Maanantai" (case is ignored)
 * Day.Month, for example "10.10"
 * Day.Month., for example "10.10."
 * @input String
 */
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


/* Checks if the string represents a weekday.
 * Returns 0 if string is not a weekday, 1 if it matches "Maanantai", 2 for "Tiistai" etc.
 * Case is ignored and typos up to MAX_DIFFERENCE allowed.
 */
const matchWeekday = str => {
    if (str.length > MAX_INPUT_LENGTH) return 0
    dist = new Array(weekdays.length)
    for (let i = 0; i < weekdays.length; i++) {
        dist[i] = [editDistance(str.toLowerCase(), weekdays[i].toLowerCase()) , i]
    }
    dist.sort((a,b) => a[0]-b[0])
    if (dist[0][0] <= MAX_DIFFERENCE) return dist[0][1] + 1
    return 0
}

/* Calculates and returns the edit distance of given strings. */
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

/*
 * Transforms a string from YYYY-MM-DD format to "Weekday day.month." -format
 */
const fromISODatetoPrettyFormat = (date) => {
  const parts = date.split('-')
  const newDate = new Date(parts[0], parts[1] -1, parts[2])
  const weekday = weekdays[newDate.getDay() -1]
  const res = `${weekday} ${newDate.getDate()}.${newDate.getMonth() +1}.`
  return res
}

/* 
 * Returns a string YYYY-MM-DD representation with leading zeroes of the given JavaScript Date object.
 */
const toISODate = date => {
    let month = ''
    if (date.getMonth() < 9) {
      month = `0${date.getMonth() + 1}`
    } else {
       month = `${date.getMonth() + 1}`
    }
    let dayNum = ''
    if (date.getDate() < 10 ) {
      dayNum = `0${date.getDate()}`
    } else {
      dayNum = `${date.getDate()}`
    }
    return `${date.getFullYear()}-${month}-${dayNum}`
}

module.exports = {
  listNWeekdays,
  matchWeekday,
  generateNextWeek,
  parseDate,
  fromISODatetoPrettyFormat
};
