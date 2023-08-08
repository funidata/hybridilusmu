import dayjs, { Dayjs } from "dayjs";
import { flatten } from "lodash";
import getDayListItemBlocks from "./day-list.item.blocks";

/**
 * Get range of days from today (inclusive) for the next `len` working days (defined as Mon-Fri).
 */
const dayRange = (len: number, days: Dayjs[] = [], i = 0): Dayjs[] => {
  if (i >= len) {
    return days;
  }

  if (days.length === 0) {
    days.push(dayjs());
    return dayRange(len, days, i + 1);
  }

  const prevDate = days.at(-1);
  const prevDay = prevDate.day();
  // Skip Saturdays (day 6) and Sundays (day 0).
  const daysToAdd = prevDay === 5 ? 3 : prevDay === 6 ? 2 : 1;
  days.push(prevDate.add(daysToAdd, "d"));

  return dayRange(len, days, i + 1);
};

const getDayListBlocks = () => {
  const dates = dayRange(14);
  const blockLists = dates.map((date) => getDayListItemBlocks({ date }));
  return flatten(blockLists);
};

export default getDayListBlocks;
