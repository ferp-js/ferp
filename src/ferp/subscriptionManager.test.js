import test from 'ava';
import sinon from 'sinon';

import { compareValue, subscriptionComparator, subscriptionManager } from './subscriptionManager.js';

test('compareValue will return true if both values are null', (t) => {
  t.truthy(compareValue(null, null));
});

test('compareValue will deeply compare objects', (t) => {
  t.falsy(compareValue({ foo: 'bar' }, { foo: 'baz' }));
});

test('compareValue will return false if both values have a different type', (t) => {
  t.falsy(compareValue([], 1));
});

test('subscriptionComparator will immediately return false if args are of different length', (t) => {
  t.falsy(subscriptionComparator([() => {}, 1])([() => {}]));
});

test('will return an empty array when there are no subscriptions', (t) => {
  t.deepEqual(subscriptionManager([], [], () => {}), []);
});

test('will attempt to call detach from old subscriptions when no new subs are passed', (t) => {
  const oldSubs = [
    { isSub: () => false, detach: sinon.fake(), raw: [() => {}, 1] },
  ];

  const newSubs = subscriptionManager(oldSubs, [], () => {});
  t.deepEqual(newSubs, []);
  t.truthy(oldSubs[0].detach.called);
});

test('will persist subs that have not been removed', (t) => {
  const detach = sinon.fake();
  const testSub = sinon.fake.returns(() => detach);

  const initialSubs = subscriptionManager([], [[testSub]], () => {});
  t.is(initialSubs.length, 1);
  t.is(testSub.callCount, 1);

  const nextSubs = subscriptionManager(initialSubs, [[testSub]], () => {});
  t.is(nextSubs.length, 1);
  t.is(testSub.callCount, 1);
});

test('will create new subs with the same function but different args', (t) => {
  const detach = sinon.fake();
  const testSub = sinon.fake.returns(() => detach);

  const initialSubs = subscriptionManager([], [[testSub, 0]], () => {});
  t.is(initialSubs.length, 1);
  t.is(testSub.callCount, 1);

  const nextSubs = subscriptionManager(initialSubs, [[testSub, 0], [testSub, 1]], () => {});
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

  const initialSubs = subscriptionManager([], [[testSub, 0]], () => {});
  t.is(initialSubs.length, 1);
  t.is(invokations.length, 1);

  const nextSubs = subscriptionManager(initialSubs, [[testSub, 0], [testSub, 1]], () => {});
  t.is(nextSubs.length, 2);
  t.is(invokations.length, 2);

  const finalSubs = subscriptionManager(nextSubs, [[testSub, 1]], () => {});
  t.is(finalSubs.length, 1);
  t.is(invokations.length, 2);
  t.is(detach.callCount, 1);
});
