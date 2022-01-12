import test from 'ava';
import * as sinon from 'sinon';
import * as effects from '../effects/core.js';
import { actionStage } from './actionStage.js';

test('sets the state, and updates in the pipeline', (t) => {
  const action = (state) => [
    { count: state.count + 1 },
    effects.none(),
  ];

  const initialProps = {
    state: { count: 0 },
    subscriptions: [],
    action,
  };

  const setState = sinon.fake(() => {});

  t.deepEqual(
    actionStage(setState, action)(initialProps),
    {
      state: { count: 1 },
      effect: effects.none(),
      subscriptions: [],
      action,
    },
  );

  t.truthy(setState.calledWith({ count: 1 }));
});

test('throws an exception if no effect is specified', (t) => {
  const action = (state) => [
    { count: state.count + 1 },
  ];

  const initialProps = {
    state: { count: 0 },
    subscriptions: [],
    action,
  };

  const setState = sinon.fake(() => {});

  t.throws(() => actionStage(setState, action)(initialProps));

  t.truthy(setState.notCalled);
});
