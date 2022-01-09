import test from 'ava';
import sinon from 'sinon';

import {
  none,
  act,
  batch,
  defer,
  thunk,
} from '../effects/core.js';
import { effectStage } from './effectStage.js';

test.before((t) => {
  t.context.sandbox = sinon.createSandbox(); // eslint-disable-line no-param-reassign
  t.context.sandbox.stub(console, 'warn');
});

test.after((t) => {
  t.context.sandbox.restore();
});

test('throws if non-effect passed as effect', (t) => {
  const dispatch = sinon.fake();

  const effect = {}
  const props = {
    fx: {},
  };

  t.throws(() => effectStage(dispatch)(props));
  t.truthy(dispatch.notCalled);
});

test('can run batched effect with act', (t) => {
  const dispatch = sinon.fake();
  const props = {
    fx: batch([act(() => []), act(() => [])]),
  }

  effectStage(dispatch)(props);

  t.is(dispatch.callCount, 2);
});

test('can run a deferred effect with promise->act', async (t) => {
  const dispatch = sinon.fake();
  const promise = new Promise((resolve) => resolve(act(() => [])));
  const props = {
    fx: defer(promise),
  };

  effectStage(dispatch)(props);

  await promise;

  t.is(dispatch.callCount, 1);
});

test('can run a deferred effect with promise constructor function->act', async (t) => {
  const dispatch = sinon.fake();
  const promise = (resolve) => resolve(act(() => []));
  const props = {
    fx: defer(promise),
  };

  await effectStage(dispatch)(props);

  t.is(dispatch.callCount, 1);
});

test('can run a deferred effect with an effect->act', async (t) => {
  const dispatch = sinon.fake();
  const actEffect = act(() => []);
  const props = {
    fx: defer(actEffect),
  };

  await effectStage(dispatch)(props);

  t.is(dispatch.callCount, 1);
});

test('can run a thunk effect with act', (t) => {
  const dispatch = sinon.fake();
  const action = () => {};
  const props = {
    fx: thunk(() => act(action)),
  };

  effectStage(dispatch)(props);

  t.is(dispatch.callCount, 1);
  t.deepEqual(dispatch.getCall(0).args[0], action);
});

test('can act from effect with params', (t) => {
  const dispatch = sinon.fake();
  const innerAction = sinon.fake((state) => [state, none()]);
  const action = sinon.fake(() => innerAction);

  const props = {
    fx: act(action(1, 2)),
  };

  effectStage(dispatch)(props);

  t.is(dispatch.callCount, 1);
  t.truthy(action.calledOnceWithExactly(1, 2), 'action was called');
  t.is(innerAction.callCount, 0);
});
