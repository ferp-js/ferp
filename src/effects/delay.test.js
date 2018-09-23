import test from 'ava';
import sinon from 'sinon';

import * as core from './core.js';

import { delay } from './delay.js';

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox({ // eslint-disable-line no-param-reassign
    useFakeTimers: true,
  });
});

test.afterEach((t) => {
  t.context.sandbox.restore();
});

test('millisecond returns a defer effect', (t) => {
  t.is(delay().type, core.effectTypes.defer);
});

test('millisecond resolves the correct message', async (t) => {
  const effect = delay('test', 1);
  t.context.sandbox.clock.tick(100);
  const message = await effect.promise;
  t.deepEqual(message, 'test');
});
