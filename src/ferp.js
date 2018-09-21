import * as appModule from './app.js';
import * as core from './effects/core.js';
import * as delay from './effects/delay.js';
import { raf } from './effects/raf.js';
import { logger } from './listeners/logger.js';
import * as every from './subscriptions/every.js';
import { Result } from './types/result.js';

export const app = appModule.app;

export const effects = {
  none: core.none,
  batch: core.batch,
  defer: core.defer,
  delay,
  raf,
};

export const middleware = {
  logger,
};

export const subscriptions = {
  every,
};

export const types = {
  Result,
};
