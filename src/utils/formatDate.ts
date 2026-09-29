import dayjs from 'dayjs';

export const formatDateTime = (timestamp: number): string =>
  dayjs(timestamp).format('MMM D, YYYY h:mm A');

export const isSameDay = (a: number, b: number): boolean =>
  dayjs(a).isSame(dayjs(b), 'day');
