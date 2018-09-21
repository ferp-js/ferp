import { defer } from './core.js';

export const millisecond = (milliseconds, message) => defer(new Promise((resolve) => {
  setTimeout(resolve, milliseconds, message);
}));

export const second = (seconds, messageType) => millisecond(seconds * 1000, messageType);
export const minute = (minutes, messageType) => second(minutes * 60, messageType);
export const hour = (hours, messageType) => minute(hours * 60, messageType);
