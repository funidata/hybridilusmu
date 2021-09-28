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

module.exports = { daysUntilMonday, generateNextWeek };
