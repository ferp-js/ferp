import { thunk, defer } from './core.js';

export const delay = (message, milliseconds) => thunk(() => defer(new Promise((resolve) => {
  setTimeout(resolve, milliseconds, message);
})));
