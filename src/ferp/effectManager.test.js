import test from 'ava';
import sinon from 'sinon';

import { effectManager } from './effectManager.js';
import {
  none,
  batch,
  defer,
  thunk,
} from './effects/core.js';

test('effectManager returns a generator', (t) => {
  const generator = effectManager(sinon.fake());

  t.is(typeof generator.next, 'function');
  t.is(typeof generator.return, 'function');

  generator.return();
});

test('effectManager can handle a none effect', (t) => {
  const dispatch = sinon.fake();

  const generator = effectManager(dispatch);
  generator.next(none());

  t.is(dispatch.callCount, 0);

  generator.return();
});

test('effectManager can handle a batch effect', async (t) => {
  const dispatch = sinon.fake();

  const a = () => {};
  const b = () => {};

  const generator = effectManager(dispatch);
  generator.next(batch([
    a,
    b,
  ]));

  t.is(dispatch.callCount, 2);
  t.truthy(dispatch.calledWithExactly(a));
  t.truthy(dispatch.calledWithExactly(b));

  generator.return();
});

test('effectManager can handle a defer effect', async (t) => {
  const dispatch = sinon.fake();

  const a = () => {};

  const generator = effectManager(dispatch);
  generator.next(defer(a));

  t.is(dispatch.callCount, 0);

  await new Promise((resolve) => setTimeout(resolve, 0));

  t.is(dispatch.callCount, 1);

  t.truthy(dispatch.calledWithExactly(a));

  generator.return();
});

test('effectManager can handle a thunk effect', (t) => {
  const dispatch = sinon.fake();

  const a = () => {};

  const generator = effectManager(dispatch);
  generator.next(thunk(() => a));

  t.is(dispatch.callCount, 1);

  t.truthy(dispatch.calledWithExactly(a));

  generator.return();
});

test('effectManager can compose effects through batch', async (t) => {
  const dispatch = sinon.fake();

  const a = () => {};
  const b = () => {};

  const generator = effectManager(dispatch);
  generator.next(batch([
    thunk(() => a),
    defer(b),
  ]));

  await new Promise((resolve) => setTimeout(resolve, 0));

  t.is(dispatch.callCount, 2);
  t.truthy(dispatch.calledWithExactly(a));
  t.truthy(dispatch.calledWithExactly(b));

  generator.return();
});

test('effectManager can pass through an action', (t) => {
  const dispatch = sinon.fake();

  const a = () => {};

  const generator = effectManager(dispatch);
  generator.next(a);

  t.is(dispatch.callCount, 1);
  t.truthy(dispatch.calledWithExactly(a));

  generator.return();
});
