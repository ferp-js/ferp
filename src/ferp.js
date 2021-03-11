import * as app from './ferp/app.js';
import * as core from './ferp/effects/core.js';
import { sub } from './ferp/subscriptions/core.js';

const effects = {
  none: core.none,
  batch: core.batch,
  defer: core.defer,
  thunk: core.thunk,
  act: core.act,
};

export {
  app,
  effects,
  sub,
};
