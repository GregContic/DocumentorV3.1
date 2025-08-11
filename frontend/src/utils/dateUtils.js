import { format, addDays, isWeekend, setHours, setMinutes } from 'date-fns';

export const formatDate = (date) => format(date, 'yyyy-MM-dd');
export const addDaysToDate = (date, days) => addDays(date, days);
export const isWeekendDay = (date) => isWeekend(date);
export const setTimeToDate = (date, hours, minutes) => {
    const dateWithHours = setHours(date, hours);
    return setMinutes(dateWithHours, minutes);
}; 