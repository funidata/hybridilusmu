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
  for (let i = 0; i < 7; i++) {
    dayNumber = currDate.getDay();
    if (dayNumber === 6 || dayNumber === 0) {
      currDate.setDate(currDate.getDate() + 1)
      continue
    }
    res.push(`${weekdays[dayNumber-1]} ${currDate.getDate()}.${currDate.getMonth() + 1}.`)
    currDate.setDate(currDate.getDate() + 1)
  }
  return res;
}

const users = new Map();
generateWeek(new Date()).forEach(d => users.set(d, []))

const getEnrollmentsFor = (date) => {
  return users.get(date)
}

const setInOffice = (userId, date) => {
  users.set(date, users.get(date).concat(userId))
}

const setAsRemote = (userId, date) => {
  users.set(date, users.get(date).filter(function(e){return e != userId}))
}

const userInOffice = (userId, date) => {
  return users.get(date).includes(userId)
}

const userIsRemote = (userId, date) => {
  return false
}

module.exports = { daysUntilMonday, generateNextWeek, generateWeek, getEnrollmentsFor, setInOffice, setAsRemote, userInOffice, userIsRemote};
