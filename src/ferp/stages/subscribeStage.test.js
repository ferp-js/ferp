import test from 'ava';
import sinon from 'sinon';
import { fx } from '../subscriptions/core.js';
import { subscribeStage } from './subscribeStage.js';
import { mutable } from '../util/mutable.js';

test('works with no previous or new subscriptions', (t) => {
  const dispatch = () => {};
  const subscriptions = mutable([]);
  const state = mutable({});
  const subscribeFn = () => [];
  const action = {};

  const result = subscribeStage(subscriptions, state, dispatch, subscribeFn)(action);

  t.deepEqual(result, action);
});

test('early exits when there is no subscribe function', (t) => {
  const dispatch = () => {};
  const subscriptions = mutable([]);
  const state = mutable({});
  const action = {};

  const result = subscribeStage(subscriptions, state, dispatch)(action);

  t.deepEqual(result, action);
});

test('starts and stops a subscription', (t) => {
  const dispatch = sinon.fake();
  const subscriptions = mutable([]);
  const state = mutable(true);
  const action = {};

  const cancel = sinon.fake();
  const mySub = sinon.fake((d) => {
    d('test');
    return cancel;
  });
  const subscribeFn = (toggle) => [
    toggle && fx(mySub),
  ];

  subscribeStage(subscriptions, state, dispatch, subscribeFn)(action);

  t.truthy(mySub.calledWithExactly(dispatch), 'Subscription started with dispatch');
  t.truthy(dispatch.calledOnceWithExactly('test'), 'Subscription gets a copy of dispatch');
  t.falsy(cancel.calledOnce, 'Subscription not cancelled');

  state.set(false);
  subscribeStage(subscriptions, state, dispatch, subscribeFn)(action);

  t.truthy(cancel.calledOnce, 'Subscription cancelled');
});

test('restarts a subscription', (t) => {
  const dispatch = sinon.fake();
  const subscriptions = mutable([]);
  const state = mutable({ toggle: true, value: 1 });
  const action = {};

  const cancel = sinon.fake();
  const mySub = sinon.fake(() => cancel);
  const subscribeFn = ({ toggle, value }) => [
    toggle && fx(mySub, value),
  ];

  subscribeStage(subscriptions, state, dispatch, subscribeFn)(action);

  t.is(mySub.callCount, 1);
  t.truthy(mySub.calledWithExactly(dispatch, 1), 'Subscription started with dispatch and value');
  t.falsy(cancel.calledOnce, 'Subscription not cancelled');

  state.set({ toggle: true, value: 2 });
  subscribeStage(subscriptions, state, dispatch, subscribeFn)(action);

  t.is(mySub.callCount, 2);
  t.truthy(mySub.calledWithExactly(dispatch, 2), 'Subscription restarted with dispatch and new value');
  t.truthy(cancel.calledOnce, 'Old subscription cancelled');

  state.set({ toggle: false, value: 2 });
  subscribeStage(subscriptions, state, dispatch, subscribeFn)(action);
  t.is(cancel.callCount, 2);
});
