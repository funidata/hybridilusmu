
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

const formateDateString = input => {
  const regex = /^([0-9]+\.[0-9]+(\.[0-9]+)?)$/
  if (!regex.test(input)) return ""
  const pieces = input.split(".")
  if (pieces[0].length == 1) pieces[0] = "0" + pieces[0]
  if (pieces[1].length == 1) pieces[1] = "0" + pieces[1]
  let dateStr = "-" + pieces[1] + "-" + pieces[0]
  if (pieces.length >= 3) {
    let zeros = 4 - pieces[2].length;
    for (let i = 0; i < zeros; i++) {
      pieces[2] = "0" + pieces[2]
    }
    dateStr = pieces[2] + dateStr
  } else dateStr = (new Date).getFullYear() + dateStr
  return dateStr
}

const getPeopleInOffice = dateStr => {
    const names = ["Jussikainen Pupu", "Missenen Misse", "Makkis"]
    return names
}

module.exports = { generateNextWeek, formateDateString, getPeopleInOffice };
