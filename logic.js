
const { DateTime } = require("luxon");
const daysUntilMonday = day => day.getDay() === 0 ? 1 : 8 - day.getDay()

const generateNextWeek = day => {
  const weekdays = [
    'Maanantai',
    'Tiistai',
    'Keskiviikko',
    'Torstai',
    'Perjantai'
  ]
  day.setDate(day.getDate() + daysUntilMonday(day))
  const result = []
  for (const weekday of weekdays) {
    result.push(`${weekday} ${day.getDate()}.${day.getMonth() + 1}.`)
    day.setDate(day.getDate() + 1)
  }
  return result
}

const formateDate = input => {
  const regex = /^([0-9]+\.[0-9]+(\.)?)$/
  if (!regex.test(input)) return DateTime.fromObject({ day: 0 })
  const pieces = input.split(".")
  let date = DateTime.fromObject({ month: pieces[1],  day: pieces[0] })
  let now = DateTime.now()
  if (date < now) date = date.plus({ years: 1 })
  return date
}

const getPeopleInOffice = date => {
    const names = ["Jussikainen Pupu", "Missenen Misse", "Makkis"]
    return names
}

module.exports = { generateNextWeek, formateDate, getPeopleInOffice, daysUntilMonday };

