import os
helper_dir = os.path.dirname(os.path.realpath(__file__))
addtnl_package_dir = os.path.dirname(helper_dir) + '/site-packages'

import sys
sys.path.append(addtnl_package_dir)

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
            date = "tänään"
            return date
        else:
            future_date = now + timedelta(days = (short_weekdays.index(weekday) + 7 - now.weekday()) % 7)
            date = "{dow}na {day}.{month}.".format(dow=weekdays[short_weekdays.index(weekday)], day=future_date.day, month=future_date.month)
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

    def get_next_working_day(self):
        """
        Return the next workday in form of Maanantai 1.1.
        Needed for finding the next workday elements on home tab
        """
        now = datetime.now()
        while now.weekday() >= 5:
            now = now + timedelta(days = (1))
        date = "{dow} {day}.{month}".format(dow=Weekdays[now.weekday()], day = now.day, month = now.month)
        return date

    def get_next_workday_info_element(self, date):
        """
        Return the XPath of the info part of the next workday
        date --- next working day in form of Maanantai 1.1.
        """
        element = "//div[@data-qa='block-kit-renderer']//div[contains(h3, '{date}')]/following-sibling::div[1]".format(date=date)
        return element

    def get_next_workday_buttons_element(self, date):
        """
        Return the XPath of the buttons part of the next workday
        date --- next working day in form of Maanantai 1.1.
        """
        element = "//div[@data-qa='block-kit-renderer']//div[contains(h3, '{date}')]/following-sibling::div[3]".format(date=date)
        return element

    def get_next_workday_short(self):
        """
        Returns the date of the next workday in a form of 1.1.
        Needed for sending slash commands
        """
        now = datetime.now() + timedelta(days = (1))
        while now.weekday() >= 5:
            now = now + timedelta(days = (1))
        date = "{day}.{month}.".format(day=now.day, month=now.month)
        return date

    def get_next_workday_long(self):
        """
        Returns the date of the next workday in a form of Maanantaina 1.1.
        Needed for checking the answers to slash commands 
        """
        now = datetime.now() + timedelta(days = (1))
        while now.weekday() >= 5:
            now = now + timedelta(days = (1))
        date = "{dow}na {day}.{month}.".format(dow=weekdays[now.weekday()], day=now.day, month=now.month)
        return date
    
    def get_next_monday(self):
        """
        Returns the date of next monday in a form of 1.1.
        Needed for testing the default signups by slash commands
        """
        now = datetime.now()
        while now.weekday() > 0:
            now = now + timedelta(days = (1))
        date = "{day}.{month}.".format(day=now.day, month=now.month)
        return date

