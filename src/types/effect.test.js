import test from 'ava';
import * as effect from './effect.js';

test.cb('effect.map returns a method that resolves multiple effects', (t) => {
  t.plan(3);

  const resolver = effect.map([effect.immediate(true)]);

  t.truthy(resolver instanceof Promise);

  resolver
    .then((resolved) => {
      t.truthy(Array.isArray(resolved));
      t.truthy(resolved[0] instanceof Promise);
      t.end();
    });
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
