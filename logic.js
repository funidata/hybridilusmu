const generateNextWeek = day => {
  const weekdays = [
    'Maanantai',
    'Tiistai',
    'Keskiviikko',
    'Torstai',
    'Perjantai'
  ]
  const daysUntilMonday = day.getDay() === 0 ? 1 : 8 - day.getDay()
  day.setDate(day.getDate() + daysUntilMonday)
  const result = []
  for (const weekday of weekdays) {
    result.push(`${weekday} ${day.getDate()}.${day.getMonth() + 1}.`)
    day.setDate(day.getDate() + 1)
  }
  return result
}

module.exports = { generateNextWeek };
