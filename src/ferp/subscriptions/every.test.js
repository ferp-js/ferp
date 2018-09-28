import test from 'ava';
import sinon from 'sinon';

import { every } from './every.js';

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox({ // eslint-disable-line no-param-reassign
    useFakeTimers: true,
  });
});

test.afterEach((t) => {
  t.context.sandbox.restore();
});

test('Every.millisecond dispatches messages', async (t) => {
  const sub = every({ type: 'test' }, 1);
  t.is(typeof sub, 'function');

  const dispatch = sinon.fake();
  const detach = sub(dispatch);
  t.context.sandbox.clock.tick(100);

  detach();
  t.deepEqual(dispatch.getCall(0).args[0], { type: 'test' });
});
