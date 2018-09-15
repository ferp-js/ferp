import * as appModule from './app.js';
import * as delay from './effects/delay.js';
import { immutable } from './middleware/immutable.js';
import { logger } from './middleware/logger.js';
import * as every from './subscriptions/every.js';
import * as effectModule from './types/effect.js';
import { Result } from './types/result.js';

export const app = appModule.app;
export const effect = effectModule;

export const effects = {
  delay,
};

export const middleware = {
  immutable,
  logger,
};

export const subscriptions = {
  every,
};

export const types = {
  Result,
};
