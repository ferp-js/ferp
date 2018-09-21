import test from 'ava';
import sinon from 'sinon';

import * as core from './core.js';

import { raf } from './raf.js';

test.before((t) => {
  t.context.spy = sinon.spy(global, 'setTimeout'); // eslint-disable-line no-param-reassign
  t.log(t.context.spy);
});

test.after((t) => {
  t.context.spy.restore();
});

test('millisecond returns a defer effect', (t) => {
  t.is(raf().type, core.effectTypes.defer);
});

test('raf resolves the correct message with no lastTimestamp', async (t) => {
  const original = Date.now;

  Date.now = () => 1;

  t.deepEqual(await raf({ type: 'test' }).promise.then(message => message), {
    type: 'test',
    delta: 0,
    lastTimestamp: undefined,
    timestamp: 1,
  });
  t.truthy(t.context.spy.called);

  Date.now = original;
});

test('raf resolves the correct message with a lastTimestamp', async (t) => {
  const now = Date.now();
  const original = Date.now;

  Date.now = () => now;
  const lastTimestamp = now - 1;

  t.deepEqual(await raf({ type: 'test' }, lastTimestamp).promise.then(message => message), {
    type: 'test',
    delta: 1,
    lastTimestamp,
    timestamp: now,
  });
  t.truthy(t.context.spy.called);

  Date.now = original;
});

// The requestAnimationFrame check isn't inlined any more, this may not be as testable
test.skip('requestAnimationFrame will use requestAnimationFrame if it is available', async (t) => {
  global.requestAnimationFrame = sinon.fake(cb => cb());

  await raf('test').promise.then(message => message);
  t.truthy(global.requestAnimationFrame.called);

  delete global.requestAnimationFrame;
});
