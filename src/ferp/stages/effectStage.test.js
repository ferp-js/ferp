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

  const props = {
    effect: {},
    dispatch,
  };

  t.throws(() => effectStage(props));
  t.truthy(dispatch.notCalled);
});

test('can run batched effect with act', (t) => {
  const dispatch = sinon.fake();
  const props = {
    effect: batch([act(() => []), act(() => [])]),
    dispatch,
  }

  effectStage(props);

  t.is(dispatch.callCount, 2);
});

test('can run a deferred effect with promise->act', async (t) => {
  const dispatch = sinon.fake();
  const promise = new Promise((resolve) => resolve(act(() => [])));
  const props = {
    effect: defer(promise),
    dispatch,
  };

  effectStage(props);

  await promise;

  t.is(dispatch.callCount, 1);
});

test('can run a deferred effect with promise constructor function->act', async (t) => {
  const dispatch = sinon.fake();
  const promise = (resolve) => resolve(act(() => []));
  const props = {
    effect: defer(promise),
    dispatch,
  };

  await effectStage(props);

  t.is(dispatch.callCount, 1);
});

test('can run a deferred effect with an effect->act', async (t) => {
  const dispatch = sinon.fake();
  const actEffect = act(() => []);
  const props = {
    effect: defer(actEffect),
    dispatch,
  };

  await effectStage(props);

  t.is(dispatch.callCount, 1);
});

test('can run a thunk effect with act', (t) => {
  const dispatch = sinon.fake();
  const action = () => {};
  const props = {
    effect: thunk(() => act(action)),
    dispatch,
  };

  effectStage(props);

  t.is(dispatch.callCount, 1);
  t.deepEqual(dispatch.getCall(0).args[0], action);
});

test('can act from effect with params', (t) => {
  const dispatch = sinon.fake();
  const innerAction = sinon.fake((state) => [state, none()]);
  const action = sinon.fake(() => innerAction);

  const props = {
    effect: act(action(1, 2)),
    dispatch,
  };

  effectStage(props);

  t.is(dispatch.callCount, 1);
  t.truthy(action.calledOnceWithExactly(1, 2), 'action was called');
  t.is(innerAction.callCount, 0);
});
