import test from 'ava';
import sinon from 'sinon';

import {
  subscriptionUpdate,
  subscriptionManager,
} from './subscriptionManager.js';

test('will return an empty array when there are no subscriptions', (t) => {
  const emptyStore = [];
  t.deepEqual(subscriptionUpdate([], [], () => {}), emptyStore);
});

test('will attempt to call detach from old subscriptions when no new subs are passed', (t) => {
  const detach = sinon.fake();
  const sub = () => () => detach;
  const oldSubs = [
    [
      [sub],
      detach,
    ],
  ];

  const newSubs = subscriptionUpdate(oldSubs, [], () => {});
  t.deepEqual(newSubs, []);
  t.truthy(detach.called);
});

test('will persist subs that have not been removed', (t) => {
  const detach = sinon.fake();
  const testSub = sinon.fake.returns(() => detach);

  const initialSubs = subscriptionUpdate([], [[testSub]], () => {});
  t.is(initialSubs.length, 1);
  t.is(testSub.callCount, 1);

  const nextSubs = subscriptionUpdate(initialSubs, [[testSub]], () => {});
  t.is(nextSubs.length, 1);
  t.is(testSub.callCount, 1);
});

test('will create new subs with the same function but different args', (t) => {
  const detach = sinon.fake();
  const testSub = sinon.fake.returns(() => detach);

  const initialSubs = subscriptionUpdate([], [[testSub, 0]], () => {});
  t.is(initialSubs.length, 1);
  t.is(testSub.callCount, 1);

  const nextSubs = subscriptionUpdate(initialSubs, [[testSub, 0], [testSub, 1]], () => {});
  t.is(nextSubs.length, 2);
  t.is(testSub.callCount, 2);
});

test('will remove new subs with the same function but different args', (t) => {
  const detach = sinon.fake();
  const invokations = [];
  const testSub = (...args) => () => {
    invokations.push({ args });
    return detach;
  };

  const initialSubs = subscriptionUpdate([], [[testSub, 0]], () => {});
  t.is(initialSubs.length, 1);
  t.is(invokations.length, 1);

  const nextSubs = subscriptionUpdate(initialSubs, [[testSub, 0], [testSub, 1]], () => {});
  t.is(nextSubs.length, 2);
  t.is(invokations.length, 2);

  const finalSubs = subscriptionUpdate(nextSubs, [[testSub, 1]], () => {});
  t.is(finalSubs.length, 1);
  t.is(invokations.length, 2);
  t.is(detach.callCount, 1);
});

test('manager returns a next and detach', (t) => {
  const dispatch = () => {};
  const testSub = () => () => () => {};
  const subscribe = () => [[testSub]];
  const manager = subscriptionManager(dispatch, subscribe);
  t.is(typeof manager.next, 'function');
  t.is(typeof manager.detach, 'function');
});

test('manager returns a next and detach with a undefined subscribe method', (t) => {
  const dispatch = () => {};
  const subscribe = undefined;
  const manager = subscriptionManager(dispatch, subscribe);
  t.is(typeof manager.next, 'function');
  t.is(typeof manager.detach, 'function');
});

test('manager detaches all subscriptions when manager is detached', (t) => {
  const dispatch = () => {};
  const detach = sinon.fake();
  const testSub = () => () => detach;
  const subscribe = () => [[testSub, 1], [testSub, 2]];
  const manager = subscriptionManager(dispatch, subscribe);
  manager.next({});
  manager.detach();
  t.is(detach.callCount, 2);
});
