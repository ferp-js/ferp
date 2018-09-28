import test from 'ava';
import { freeze } from './freeze.js';

test('returns a new object back', (t) => {
  const sourceObject = {};
  t.not(sourceObject, freeze(sourceObject));
});

test('allows all getters', (t) => {
  const object = freeze({ foo: 'bar' });
  t.is(object.foo, 'bar');
});

test('disallows setters', (t) => {
  const object = freeze({ foo: 'bar' });
  t.throws(() => {
    object.foo = 'baz';
  });
});

test('disallows extensions', (t) => {
  const object = freeze({ foo: 'bar' });
  t.throws(() => {
    object.bar = 'test';
  });
});

test('disallows deletes', (t) => {
  const object = freeze({ foo: 'bar' });
  t.throws(() => delete object.foo);
});

test('lazy freezes deeply', (t) => {
  const object = freeze({ foo: { bar: 'baz' } });
  t.throws(() => {
    object.foo.bar = 'test';
  });
});

test('freezes arrays', (t) => {
  const arr = freeze([1, 2, 3]);
  t.is(Array.isArray(arr), true);
  t.throws(() => arr.push(4));
});

test('allows for non-objects to be returned', (t) => {
  t.plan(3);
  t.notThrows(() => freeze('test'));
  t.notThrows(() => freeze(123));
  t.notThrows(() => freeze(true));
});

test('disallows string modification', (t) => {
  const string = freeze('gello, world');
  t.throws(() => {
    string[0] = 'h';
  });
});
