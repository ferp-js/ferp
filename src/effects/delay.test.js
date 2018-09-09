import test from 'ava';
import sinon from 'sinon';

import { Effect } from '../types/effect.js';

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
  t.truthy(delay.millisecond() instanceof Effect);
});

test('millisecond resolves the correct message', async (t) => {
  t.deepEqual(await delay.millisecond(0, 'test').then(message => message), { type: 'test' });
  t.truthy(t.context.spy.called);
});

test('raf resolves the correct message with no lastTimestamp', async (t) => {
  const original = Date.now;

  Date.now = () => 1;

  t.deepEqual(await delay.raf('test').then(message => message), {
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

  t.deepEqual(await delay.raf('test', lastTimestamp).then(message => message), {
    type: 'test',
    delta: 1,
    lastTimestamp,
    timestamp: now,
  });
  t.truthy(t.context.spy.called);

  Date.now = original;
});

test('requestAnimationFrame will use requestAnimationFrame if it is available', async (t) => {
  global.requestAnimationFrame = sinon.fake(cb => cb());

  await delay.raf('test').then(message => message);
  t.truthy(global.requestAnimationFrame.called);

  delete global.requestAnimationFrame;
});
