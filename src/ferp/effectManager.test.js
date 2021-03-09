import test from 'ava';
import sinon from 'sinon';

import { runEffect } from './effectManager.js';
import {
  none,
  batch,
  defer,
  thunk,
  act,
} from './effects/core.js';

test('can handle a none effect', (t) => {
  const dispatch = sinon.fake();

  runEffect(dispatch, none());

  t.is(dispatch.callCount, 0);
});

test('effectManager can handle a batch effect', async (t) => {
  const dispatch = sinon.fake();

  const a = () => [null, none()];
  const b = () => [null, none()];

  runEffect(dispatch, batch([
    act(a),
    act(b),
  ]));

  t.is(dispatch.callCount, 2);
  t.truthy(dispatch.calledWith(a));
  t.truthy(dispatch.calledWith(b));
});

test('effectManager can handle a defer effect', async (t) => {
  const dispatch = sinon.fake();

  const action = () => [null, none()];
  const a = (resolve) => resolve(act(action));

  runEffect(dispatch, defer(a));
  await new Promise((resolve) => setTimeout(resolve, 1));

  t.is(dispatch.callCount, 1);

  t.truthy(dispatch.calledWithExactly(action));
});

test('effectManager can handle a thunk effect', (t) => {
  const dispatch = sinon.fake();

  const a = () => [null, none()];

  runEffect(dispatch, thunk(() => act(a)));

  t.is(dispatch.callCount, 1);

  t.truthy(dispatch.calledWithExactly(a));
});

test('effectManager can compose effects through batch', async (t) => {
  const dispatch = sinon.fake();

  const a = () => [null, none()];
  const b = () => [null, none()];

  runEffect(dispatch, batch([
    thunk(() => act(a)),
    act(b),
  ]));

  await new Promise((resolve) => setTimeout(resolve, 0));

  t.is(dispatch.callCount, 2);
  t.truthy(dispatch.calledWithExactly(a));
  t.truthy(dispatch.calledWithExactly(b));
});

