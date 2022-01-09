import test from 'ava';
import sinon from 'sinon';
import { sub } from '../subscriptions/core.js';
import { subscribeStage } from './subscribeStage.js';

test('works with no previous or new subscriptions', (t) => {
  const dispatch = sinon.fake(() => {});
  const props = {
    state: {},
    subscriptions: [],
  };
  const subscribeFn = () => [];
  const setSubscriptions = sinon.fake(() => {});

  t.notThrows(() => subscribeStage(setSubscriptions, dispatch, subscribeFn)(props));
  t.truthy(dispatch.notCalled);
});

test('early exits when there is no subscribe function', (t) => {
  const dispatch = sinon.fake(() => {});
  const props = {
    state: {},
    subscriptions: [],
  };
  const subscribeFn = undefined;
  const setSubscriptions = sinon.fake(() => {});

  const { subscriptions } = subscribeStage(setSubscriptions, dispatch, subscribeFn)(props);

  t.truthy(setSubscriptions.notCalled);
});

test('starts and stops a subscription', (t) => {
  const dispatch = sinon.fake();
  let props = {
    state: true,
    subscriptions: [],
  };

  const cancel = sinon.fake();
  const mySub = sinon.fake((d, foo) => {
    d('test');
    return cancel;
  });
  const subscribeFn = (toggle) => [
    toggle && sub(mySub, 'abc'),
    sub(mySub, 'def'),
  ];
  const setSubscriptions = sinon.fake((subs) => props.subscriptions = subs);

  props = subscribeStage(setSubscriptions, dispatch, subscribeFn)(props);

  t.truthy(mySub.calledWithExactly(dispatch, 'abc'), 'Subscription started with dispatch');
  t.truthy(mySub.calledWithExactly(dispatch, 'def'), 'Subscription started with dispatch');
  t.truthy(dispatch.calledWithExactly('test'), 'Subscription gets a copy of dispatch');
  t.falsy(cancel.calledOnce, 'Subscription not cancelled');

  props.state = false;
  subscribeStage(setSubscriptions, dispatch, subscribeFn)(props);

  t.truthy(cancel.calledOnce, 'Subscription cancelled');
});
