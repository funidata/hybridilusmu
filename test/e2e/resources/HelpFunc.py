from pynput.keyboard import Key, Controller
import datetime


class HelpFunc(object):

    def cancelPopup(self):
        keyboard = Controller()
        keyboard.press(Key.space)
        keyboard.release(Key.space)

    def get_current_date(self):
        months = ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta',
    'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta']
        now = datetime.datetime.now()
        date = "{day}. {month} {year}".format(day=now.day, month=months[now.month - 1], year=now.year)
        return date