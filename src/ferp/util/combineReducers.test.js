import test from 'ava';

import { batch } from '../effects/core.js';

import { combineReducersFromArray, combineReducersFromObject, combineReducers } from './combineReducers.js';

const fixtures = {
  array: {
    before: [
      [{ a: 1 }, { type: 'EFFECT 1' }],
      [{ b: 1 }, { type: 'EFFECT 2' }],
      [{ c: 1 }, { type: 'EFFECT 3' }],
    ],
    expected: [
      [{ a: 1 }, { b: 1 }, { c: 1 }],
      batch([
        { type: 'EFFECT 1' },
        { type: 'EFFECT 2' },
        { type: 'EFFECT 3' },
      ]),
    ],
  },
  arrayWithArrayState: {
    before: [
      [[1, 2], { type: 'EFFECT 1' }],
      [[3, 4], { type: 'EFFECT 2' }],
      [[5, 6], { type: 'EFFECT 3' }],
    ],
    expected: [
      [[1, 2], [3, 4], [5, 6]],
      batch([
        { type: 'EFFECT 1' },
        { type: 'EFFECT 2' },
        { type: 'EFFECT 3' },
      ]),
    ],
  },
  object: {
    before: {
      a: [1, { type: 'EFFECT 1' }],
      b: [1, { type: 'EFFECT 2' }],
      c: [1, { type: 'EFFECT 3' }],
    },
    expected: [
      { a: 1, b: 1, c: 1 },
      batch([
        { type: 'EFFECT 1' },
        { type: 'EFFECT 2' },
        { type: 'EFFECT 3' },
      ]),
    ],
  },
};

test('combineReducersFromArray returns a single tuple of state and effects', (t) => {
  t.deepEqual(combineReducersFromArray(fixtures.array.before), fixtures.array.expected);
});

test('combineReducersFromArray can maintain a state that is array-based', (t) => {
  t.deepEqual(
    combineReducersFromArray(fixtures.arrayWithArrayState.before),
    fixtures.arrayWithArrayState.expected,
  );
});

test('combineReducersFromObject returns a single tuple of state and effects', (t) => {
  t.deepEqual(combineReducersFromObject(fixtures.object.before), fixtures.object.expected);
});

test('combineReducers will pick the sub function based on whether the result is an array', (t) => {
  t.deepEqual(combineReducers(fixtures.array.before), fixtures.array.expected);
  t.deepEqual(combineReducers(fixtures.object.before), fixtures.object.expected);
});
