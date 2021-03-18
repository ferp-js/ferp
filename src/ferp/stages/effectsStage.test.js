import test from 'ava';
import sinon from 'sinon';

import { none, act, batch, defer, thunk } from '../effects/core.js';
import { effectStage } from './effectStage.js';
import { mutable } from '../util/mutable.js';

test.before((t) => {
  t.context.sandbox = sinon.createSandbox();
  t.context.sandbox.stub(console, 'warn');
});

test.after((t) => {
  t.context.sandbox.restore();
});

test('reports a deprecation warning when an action-function is dispatched', (t) => {
  const dispatch = sinon.fake();
  const action = {};

  const actionFn = () => [null, none()];
  const effect = mutable(actionFn);

  const result = effectStage(effect, dispatch)(action);

  t.deepEqual(action, result);

  t.truthy(console.warn.calledWith('DEPRECATION')); // eslint-disable-line no-console
  t.truthy(dispatch.calledOnceWithExactly(act(actionFn)));
});

test('throws TypeError when there is an unrecognized effect', (t) => {
  const dispatch = sinon.fake();

  const effect = mutable('foo');

  const error = t.throws(
    () => effectStage(effect, dispatch)(),
    {
      instanceOf: TypeError,
      message: 'Unable to run effect',
    },
  );
  t.is(error.effect, 'foo');
});

test('can run batched effect with act', async (t) => {
  const dispatch = sinon.fake();
  const effect = mutable(batch([act(() => []), act(() => [])]));

  effectStage(effect, dispatch)();

  t.is(dispatch.callCount, 2);
});

test('can run a deferred effect with act', async (t) => {
  const dispatch = sinon.fake();
  const promise = new Promise((resolve) => resolve(act(() => [])));
  const effect = mutable(defer(promise));

  effectStage(effect, dispatch)();

  await promise;

  t.is(dispatch.callCount, 1);
});

test('can run a thunk effect with act', (t) => {
  const dispatch = sinon.fake();
  const effect = mutable(thunk(() => act(() => [])));

  effectStage(effect, dispatch)();

  t.is(dispatch.callCount, 1);
});
