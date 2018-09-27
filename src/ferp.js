import * as appModule from './app.js';
import * as core from './effects/core.js';
import { delay } from './effects/delay.js';
import { raf } from './effects/raf.js';
import { every } from './subscriptions/every.js';
// import {
//   nothing,
//   pending,
//   just,
//   error,
//   get,
//   getWithDefault,
// } from './types/result.js';
import { combineReducers } from './util/combineReducers.js';

export const app = appModule.app;

export const effects = {
  none: core.none,
  batch: core.batch,
  defer: core.defer,
  thunk: core.thunk,
  delay,
  raf,
};

export const subscriptions = {
  every,
};

// export const result = {
//   nothing,
//   pending,
//   just,
//   error,
//   get,
//   getWithDefault,
// };
//
export const util = {
  combineReducers,
};
