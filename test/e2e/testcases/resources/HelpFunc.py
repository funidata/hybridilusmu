from pynput.keyboard import Key, Controller
from datetime import datetime, timedelta

months = ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta',
    'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta']
weekdays = ['maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai']
Weekdays = ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai']
short_weekdays = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']

class HelpFunc(object):

    def cancelPopup(self):
        """Cancels a popup asking to open Slack in desktop app"""
        keyboard = Controller()
        keyboard.press(Key.space)
        keyboard.release(Key.space)

    def get_current_date_for_home_tab_update(self):
        """
        Returns a date in form of '1. tammikuuta 2021.
        Used in home tab's update message.
        """
        now = datetime.now()
        date = "{day}. {month} {year}".format(day=now.day, month=months[now.month - 1], year=now.year)
        return date

    def get_date_for_message_tab(self, weekday):
        """
        Returns the date that should be in the answer to the /listaa command.
        weekday --- weekday shortcut given as a parameter to the /listaa command.
        Date in form of 'Maanantaina 1.1'.
        """
        now = datetime.now()
        if now.weekday() == short_weekdays.index(weekday):
            date = "{dow}na {day}.{month}".format(dow=weekdays[short_weekdays.index(weekday)], day=now.day, month=now.month)
            return date
        else:
            future_date = now + timedelta(days = (short_weekdays.index(weekday) + 7 - now.weekday()) % 7)
            date = "{dow}na {day}.{month}".format(dow=weekdays[short_weekdays.index(weekday)], day=future_date.day, month=future_date.month)
            return date

    def get_dates_for_home_tab_signups(self):
        """
        Returns an array of the next 10 weekdays.
        Used for checking the dates in home tab.
        Dates in form of 'Maanantai 1.1'.
        """
        date_array = []
        now = datetime.now()
        while len(date_array) < 10:
            while now.weekday() >= 5:
                now = now + timedelta(days = (1))
            date = "{dow} {day}.{month}".format(dow=Weekdays[now.weekday()], day = now.day, month = now.month)
            date_array.append(date)
            now = now + timedelta(days = (1))
        return date_array


