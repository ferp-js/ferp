import { defer } from './core.js';

export const delay = (message, milliseconds) => defer(new Promise((resolve) => {
  setTimeout(resolve, milliseconds, message);
}));
