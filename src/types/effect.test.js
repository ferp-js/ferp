import test from 'ava';
import * as effect from './effect.js';

test('effect.map returns an array of effects', (t) => {
  const resolver = effect.map([effect.immediate(true)]);
  t.truthy(Array.isArray(resolver));
});

test('effect.defer allows the effect to resolve externally', (t) => {
  t.plan(4);
  const result = effect.defer();
  const resultKeys = Object.keys(result);
  t.truthy(resultKeys.includes('dispatch'));
  t.truthy(resultKeys.includes('effect'));
  t.is(typeof result.dispatch, 'function');
  t.truthy(result.effect instanceof Promise);
});

test('effect.none resolves to null', async (t) => {
  t.is(await effect.none(), null);
});
