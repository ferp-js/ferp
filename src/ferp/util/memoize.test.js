import test from 'ava';
import { memoizeStore, memoize, getMemoized } from './memoize.js';

test('memoizeStore creates a store', (t) => {
  const result = memoizeStore();
  t.truthy(result instanceof Map);
});

test('memoize creates a new store', (t) => {
  const initialStore = memoizeStore();
  const store = memoize([1, 2, 3], 'test', initialStore);

  t.truthy(store instanceof Map);
  t.falsy(store == initialStore); // eslint-disable-line eqeqeq
});

test('memoize overrides keys', (t) => {
  const initialStore = memoize([1, 2, 3], 'test', memoizeStore());
  const store = memoize([1, 2, 3], 'value', initialStore);

  t.truthy(store instanceof Map);
  t.falsy(store == initialStore); // eslint-disable-line eqeqeq
  t.is(store.size, 1);
});

test('memoize appends the store', (t) => {
  let store = memoizeStore();
  store = memoize([1, 2, 3], 'test', store);
  store = memoize([4, 5, 6], 'value', store);
  store = memoize([7, 8, 9], 'value', store);

  t.is(store.size, 3);
});

test('getMemoized can find the correct array key', (t) => {
  const originalKey = [1, 'foo', { baz: 'test' }];
  const store = memoize(originalKey, 'value', memoizeStore());

  const expected = { found: true, key: originalKey, result: 'value' };

  t.deepEqual(getMemoized(originalKey, store), expected);
  t.deepEqual(getMemoized([1, 'foo', { baz: 'test' }], store), expected);
});

test('getMemoized can return a not found result', (t) => {
  const originalKey = [1, 'foo', { baz: 'test' }];
  const store = memoize(originalKey, 'value', memoizeStore());

  const expected = { found: false, key: undefined, result: undefined };

  t.deepEqual(getMemoized([], store), expected);
  t.deepEqual(getMemoized(['test'], store), expected);
  t.deepEqual(getMemoized([1, 'foo', { baz: 'wow' }], store), expected);
  t.deepEqual(getMemoized([1, 'foo', { baz: 'wow', other: 'hmm' }], store), expected);
  t.deepEqual(getMemoized([1, true, { baz: 'wow', other: 'hmm' }], store), expected);
});
