import test from 'ava';
import sinon from 'sinon';
import { compareArrays } from './compareArrays.js';

test('early exits if the arrays have different length', (t) => {
  t.is(compareArrays([], [null]), false);
});

test('early exits if the arrays are the same reference', (t) => {
  const arr = [1, 2, 3];
  t.is(compareArrays(arr, arr), true);
});

test('throws if an object comparison is too deep, even if they are the same', (t) => {
  const warn = sinon.fake();
  sinon.replace(console, 'warn', warn);
  const deepObject = { foo: { bar: { baz: 'fizz' } } };
  t.is(compareArrays([deepObject], [{ foo: { bar: { baz: 'fizz' } } }]), false);
  t.is(warn.callCount, 1);
  sinon.restore();
});

test('does a quick object comparison when two objects are the same', (t) => {
  const deepObject = { foo: { bar: { baz: 'fizz' } } };
  t.is(compareArrays([deepObject], [deepObject]), true);
});

test('recursively tests object values', (t) => {
  const a = [{ foo: { bar: 'baz' } }];
  const b = [{ foo: { bar: 'baz' } }];
  t.is(compareArrays(a, b), true);
});
