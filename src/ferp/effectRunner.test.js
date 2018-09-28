import test from 'ava';
import sinon from 'sinon';

import { effectRunner } from './effectRunner.js';
import {
  none,
  batch,
  defer,
  thunk,
} from './effects/core.js';

test('effectRunner generates a method', (t) => {
  const runner = effectRunner(sinon.fake());
  t.is(typeof runner, 'function');
});

test('the generated method can handle a none effect', async (t) => {
  const fake = sinon.fake();
  await t.notThrowsAsync(() => effectRunner(fake)(none()));
  t.falsy(fake.called);
});

test('the generated method can handle a batch effect', async (t) => {
  const fake = sinon.fake();
  const runner = effectRunner(fake);
  await t.notThrowsAsync(() => runner(batch([])));
  t.falsy(fake.called);
});

test('the generated method can handle a batch message effect', async (t) => {
  const fake = sinon.fake();
  const runner = effectRunner(fake);
  await t.notThrowsAsync(() => runner(batch([1, 2])));
  t.is(fake.callCount, 2);
});

test('the generated method can handle a defer none effect', async (t) => {
  const fake = sinon.fake();
  const runner = effectRunner(fake);
  await t.notThrowsAsync(() => runner(defer(new Promise(resolve => resolve(none())))));
  t.falsy(fake.called);
});

test('the generated method can handle a thunk none effect', async (t) => {
  const fake = sinon.fake();
  const runner = effectRunner(fake);
  await t.notThrowsAsync(() => runner(thunk(() => none())));
  t.falsy(fake.called);
});
