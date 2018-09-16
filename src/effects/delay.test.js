import test from 'ava';
import sinon from 'sinon';

import * as delay from './delay.js';

test.before((t) => {
  t.context.spy = sinon.spy(global, 'setTimeout'); // eslint-disable-line no-param-reassign
  t.log(t.context.spy);
});

test.after((t) => {
  t.context.spy.restore();
});

test('exports millisecond, second, minute, hour, and raf', (t) => {
  t.deepEqual(Object.keys(delay), [
    'millisecond',
    'second',
    'minute',
    'hour',
    'raf',
  ]);
});

test('millisecond returns an effect', (t) => {
  t.truthy(delay.millisecond() instanceof Promise);
});

test('millisecond resolves the correct message', async (t) => {
  t.deepEqual(await delay.millisecond(0, 'test').then(message => message), { type: 'test' });
  t.truthy(t.context.spy.called);
});

test('raf resolves the correct message with no lastTimestamp', async (t) => {
  const requestFrame = callback => callback(1);

  t.deepEqual(await delay.raf('test', undefined, requestFrame).then(message => message), {
    type: 'test',
    delta: 0,
    lastTimestamp: undefined,
    timestamp: 1,
  });
});

test('raf resolves the correct message with a lastTimestamp', async (t) => {
  const lastTimestamp = 1;
  const timestamp = 2;
  const requestFrame = callback => callback(timestamp);

  t.deepEqual(await delay.raf('test', lastTimestamp, requestFrame).then(message => message), {
    type: 'test',
    delta: timestamp - lastTimestamp,
    lastTimestamp,
    timestamp,
  });
  t.truthy(t.context.spy.called);
});

test('requestAnimationFrame will use requestAnimationFrame if it is available', async (t) => {
  const requestFrame = sinon.fake(cb => cb());

  await delay.raf('test', undefined, requestFrame).then(message => message);
  t.truthy(requestFrame.called);
});
