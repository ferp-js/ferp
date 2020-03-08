import test from 'ava';
import sinon from 'sinon';

import { effectManager } from './effectManager.js';
import {
  none,
  batch,
  defer,
  thunk,
} from './effects/core.js';

test('effectManager generates a method', (t) => {
  const runner = effectManager(sinon.fake());
  t.is(typeof runner, 'function');
});

test('the generated method can handle a none effect', async (t) => {
  const fake = sinon.fake();
  await t.notThrowsAsync(() => effectManager(fake)(none()));
  t.falsy(fake.called);
});

test('the generated method can handle a batch effect', async (t) => {
  const fake = sinon.fake();
  const runner = effectManager(fake);
  await t.notThrowsAsync(() => runner(batch([])));
  t.falsy(fake.called);
});

test('the generated method can handle a batch message effect', async (t) => {
  const fake = sinon.fake();
  const runner = effectManager(fake);
  await t.notThrowsAsync(() => runner(batch([1, 2])));
  t.is(fake.callCount, 2);
});

test('the generated method can handle a defer none effect', async (t) => {
  const fake = sinon.fake();
  const runner = effectManager(fake);
  await t.notThrowsAsync(() => runner(defer(new Promise((resolve) => resolve(none())))));
  t.falsy(fake.called);
});

test('the generated method can handle a thunk none effect', async (t) => {
  const fake = sinon.fake();
  const runner = effectManager(fake);
  await t.notThrowsAsync(() => runner(thunk(() => none())));
  t.falsy(fake.called);
});
