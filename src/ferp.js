import * as appModule from './ferp/app.js';
import * as core from './ferp/effects/core.js';

export const app = appModule.app;

export const effects = {
  none: core.none,
  batch: core.batch,
  defer: core.defer,
  thunk: core.thunk,
  act: core.act,
};
