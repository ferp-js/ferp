import test from 'ava';
import {
  memoizeStore,
  memoizeSize,
  memoize,
  memoizeGet,
} from './memoize.js';

test('memoizeStore can accept an initializer', (t) => {
  const store = memoizeStore([[[1, 2, 3], 'test']]);
  t.is(memoizeSize(store), 1);
});

test('memoizeSize reflects the current size', (t) => {
  const initialStore = memoizeStore();
  t.is(memoizeSize(initialStore), 0);

  const updatedStore = memoize([1, 2, 3], 'test', initialStore);
  t.is(memoizeSize(updatedStore), 1);
});

test('memoize is immutable, adding data results in a new store', (t) => {
  const initialStore = memoizeStore();
  const store = memoize([1, 2, 3], 'test', initialStore);

  t.is(store == initialStore, false); // eslint-disable-line eqeqeq
});

test('memoize overrides keys', (t) => {
  const initialStore = memoize([1, 2, 3], 'test', memoizeStore());
  const store = memoize([1, 2, 3], 'value', initialStore);

  t.falsy(store == initialStore); // eslint-disable-line eqeqeq
  t.is(memoizeSize(store), 1);
});

test('memoize appends the store', (t) => {
  let store = memoizeStore();
  store = memoize([1, 2, 3], 'test', store);
  store = memoize([4, 5, 6], 'value', store);
  store = memoize([7, 8, 9], 'value', store);

  t.is(memoizeSize(store), 3);
});

test('memoizeGet can find the correct array key', (t) => {
  const originalKey = [1, 'foo', { baz: 'test' }];
  const store = memoize(originalKey, 'value', memoizeStore());

  const expected = { found: true, key: originalKey, result: 'value' };

  t.deepEqual(memoizeGet(originalKey, store), expected);
  t.deepEqual(memoizeGet([1, 'foo', { baz: 'test' }], store), expected);
});

test('memoizeGet can return a not found result', (t) => {
  const originalKey = [1, 'foo', { baz: 'test' }];
  const store = memoize(originalKey, 'value', memoizeStore());

  const expected = { found: false, key: undefined, result: undefined };

  t.deepEqual(memoizeGet([], store), expected);
  t.deepEqual(memoizeGet(['test'], store), expected);
  t.deepEqual(memoizeGet([1, 'foo', { baz: 'wow' }], store), expected);
  t.deepEqual(memoizeGet([1, 'foo', { baz: 'wow', other: 'hmm' }], store), expected);
  t.deepEqual(memoizeGet([1, true, { baz: 'wow', other: 'hmm' }], store), expected);
});
