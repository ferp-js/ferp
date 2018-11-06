import test from 'ava';
import sinon from 'sinon';

import { pure, storeKey } from './pure.js';

test('returns a memoized version of the function', (t) => {
  const original = num => num;
  const result = pure(original);
  t.is(typeof result, 'function');
  t.truthy(result[storeKey]() instanceof Map);
});

test('pure uses the memoized value when possible', (t) => {
  const original = sinon.fake(num => num);
  const wrapped = pure(original);

  const firstValue = wrapped(5);
  const secondValue = wrapped(5);

  t.is(original.callCount, 1);
  t.is(firstValue, 5);
  t.is(secondValue, 5);
});

test('impure functions wrapped in pure will always return first memoized value', (t) => {
  const wrapped = pure(num => num + Math.random());

  const firstValue = wrapped(5);
  const secondValue = wrapped(5);

  t.is(firstValue, secondValue);
});
