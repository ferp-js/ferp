import test from 'ava';
import sinon from 'sinon';
import { sub } from '../subscriptions/core.js';
import { subscribeStage } from './subscribeStage.js';

test('works with no previous or new subscriptions', (t) => {
  const dispatch = sinon.fake(() => {});
  const props = {
    state: {},
    subscriptions: [],
    dispatch,
  };
  const subscribeFn = () => [];
  const setSubscriptions = sinon.fake(() => {});

  t.notThrows(() => subscribeStage(setSubscriptions, subscribeFn)(props));
  t.truthy(dispatch.notCalled);
});

test('early exits when there is no subscribe function', (t) => {
  const dispatch = sinon.fake(() => {});
  const props = {
    state: {},
    subscriptions: [],
    dispatch,
  };
  const subscribeFn = undefined;
  const setSubscriptions = sinon.fake(() => {});

  const { subscriptions } = subscribeStage(setSubscriptions, subscribeFn)(props);

  t.truthy(setSubscriptions.notCalled);
  t.deepEqual(subscriptions, []);
});

test('starts and stops a subscription', (t) => {
  const dispatch = sinon.fake();
  let props = {
    state: true,
    subscriptions: [],
    dispatch,
  };

  const cancel = sinon.fake();
  const mySub = sinon.fake((d) => {
    d('test');
    return cancel;
  });
  const subscribeFn = (toggle) => [
    toggle && sub(mySub, 'abc'),
    sub(mySub, 'def'),
  ];
  const setSubscriptions = sinon.fake((subs) => { props.subscriptions = subs; });

  props = subscribeStage(setSubscriptions, subscribeFn)(props);

  t.truthy(mySub.calledWithExactly(dispatch, 'abc'), 'Subscription started with dispatch');
  t.truthy(mySub.calledWithExactly(dispatch, 'def'), 'Subscription started with dispatch');
  t.truthy(dispatch.calledWithExactly('test'), 'Subscription gets a copy of dispatch');
  t.falsy(cancel.calledOnce, 'Subscription not cancelled');

  props.state = false;
  subscribeStage(setSubscriptions, subscribeFn)(props);

  t.truthy(cancel.calledOnce, 'Subscription cancelled');
});
