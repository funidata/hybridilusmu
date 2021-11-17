from pynput.keyboard import Key, Controller
from datetime import datetime, timedelta
from decouple import config

months = ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta',
    'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta']
weekdays = ['maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai']
Weekdays = ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai']
short_weekdays = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']

class HelpFunc(object):

    def cancelPopup(self):
        keyboard = Controller()
        keyboard.press(Key.space)
        keyboard.release(Key.space)

    def get_current_date_for_home_tab_update(self):
        now = datetime.now()
        date = "{day}. {month} {year}".format(day=now.day, month=months[now.month - 1], year=now.year)
        return date

    def get_date_for_message_tab(self, weekday):
        now = datetime.now()
        if now.weekday() == short_weekdays.index(weekday):
            date = "{dow}na {day}.{month}".format(dow=weekdays[short_weekdays.index(weekday)], day=now.day, month=now.month)
            return date
        else:
            future_date = now + timedelta(days = (short_weekdays.index(weekday) + 7 - now.weekday()) % 7)
            date = "{dow}na {day}.{month}".format(dow=weekdays[short_weekdays.index(weekday)], day=future_date.day, month=future_date.month)
            return date

    def get_date_for_home_tab_signups(self, order):
        now = datetime.now() + timedelta(days = (order))
        while now.weekday() >= 5:
            now = now + timedelta(days = (1))
        date = "{dow} {day}.{month}".format(dow=Weekdays[now.weekday()], day = now.day, month = now.month)
        return date

    def get_list_command(self):
        command = "/{prefix}listaa".format(prefix=config('COMMAND_PREFIX'))
        return command

