import test from 'ava';
import sinon from 'sinon';

import * as core from './core.js';

import { delay } from './delay.js';
import { effectManager } from '../effectManager.js';

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox({ // eslint-disable-line no-param-reassign
    useFakeTimers: true,
  });
});

test.afterEach((t) => {
  t.context.sandbox.restore();
});

test('millisecond returns a thunk-defer effect', (t) => {
  t.is(delay().type, core.effectTypes.thunk);
  t.is(delay().method().type, core.effectTypes.defer);
});

test.cb('millisecond resolves the correct message', (t) => {
  const effect = delay('test', 1);
  const manager = effectManager((message) => {
    t.deepEqual(message, 'test');
    t.end();
  });
  manager(effect);
  t.context.sandbox.clock.tick(100);
});
