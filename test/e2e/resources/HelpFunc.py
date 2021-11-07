from pynput.keyboard import Key, Controller
from datetime import datetime, timedelta


class HelpFunc(object):

    def cancelPopup(self):
        keyboard = Controller()
        keyboard.press(Key.space)
        keyboard.release(Key.space)

    def get_current_date_for_home_tab(self):
        months = ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta',
    'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta']
        now = datetime.now()
        date = "{day}. {month} {year}".format(day=now.day, month=months[now.month - 1], year=now.year)
        return date

    def get_date_for_message_tab(self, weekday):
        weekdays = ['maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai']
        short_weekdays = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']
        now = datetime.now()
        if now.weekday() == short_weekdays.index(weekday):
            date = "{dow}na {day}.{month}".format(dow=weekdays[short_weekdays.index(weekday)], day=now.day, month=now.month)
            return date
        else:
            future_date = now + timedelta(days = (short_weekdays.index(weekday) + 7 - now.weekday()) % 7)
            date = "{dow}na {day}.{month}".format(dow=weekdays[short_weekdays.index(weekday)], day=future_date.day, month=future_date.month)
            return date

