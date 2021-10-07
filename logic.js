
const { DateTime } = require("luxon");
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

const parseDate = input => {
  if (input.length < 20) {
    weekday = matchesWeekday(input)
    if (weekday != 0) {
        let date = DateTime.now()
        return date.plus({ days: (weekday + 7 - date.weekday)%7 })
    }
  }
  const regex = /^([0-9]+\.[0-9]+(\.)?)$/
  if (!regex.test(input)) return DateTime.fromObject({ day: 0 })
  const pieces = input.split(".")
  let date = DateTime.fromObject({ month: pieces[1],  day: pieces[0] })
  let now = DateTime.now()
  if (date < now.minus({ days: 1 })) date = date.plus({ years: 1 })
  return date
}

const getPeopleInOffice = date => {
    const names = ["Jussikainen Pupu", "Missenen Misse", "Makkis"]
    return names
}


//returns 0 if no match, 1 if matches monday, 2 for tuesday etc.
const matchesWeekday = str => {
    dist = new Array(weekdays.length)
    for (let i = 0; i < weekdays.length; i++) {
        dist[i] = [editDistance(str.toLowerCase(), weekdays[i].toLowerCase()) , i]
    }
    dist.sort((a,b)=>a[0]-b[0])
    if (dist[0][0] <= 3) return dist[0][1] + 1
    return 0
}

const editDistance = (str1, str2) => {
   a = str1.length
   b = str2.length
   dp = new Array(a+1)
   for (let i = 0; i < a+1; i++) {
     dp[i] = new Array(b+1)
   }
   for (let i = 0; i <= a; i++) {
     dp[i][0] = i
   }
   for (let i = 0; i <= b; i++) {
     dp[0][i] = i
   }
   for (let i = 1; i <= a; i++) {
      for (let j = 1; j <= b; j++) {
        c = (str1[i-1] === str2[j-1] ? 0 : 1)
        dp[i][j] = Math.min(dp[i][j-1] + 1, dp[i-1][j] + 1, dp[i-1][j-1] + c)
      }
   }
   return dp[a][b]
}

module.exports = { generateNextWeek, parseDate, getPeopleInOffice, daysUntilMonday ,editDistance, matchesWeekday};

