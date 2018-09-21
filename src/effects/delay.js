import { defer } from './core.js';

export const millisecond = (milliseconds, message) => defer(new Promise((resolve) => {
  setTimeout(resolve, milliseconds, message);
}));

export const second = (seconds, message) => millisecond(seconds * 1000, message);
export const minute = (minutes, message) => second(minutes * 60, message);
export const hour = (hours, message) => minute(hours * 60, message);
