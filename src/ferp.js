import * as appModule from './ferp/app.js';
import * as core from './ferp/effects/core.js';
import { every } from './ferp/subscriptions/every.js';
import { combineReducers } from './ferp/util/combineReducers.js';

export const app = appModule.app;

export const effects = {
  none: core.none,
  batch: core.batch,
  defer: core.defer,
  thunk: core.thunk,
  act: core.act,
};

export const subscriptions = {
  every,
};

export const util = {
  combineReducers,
};
