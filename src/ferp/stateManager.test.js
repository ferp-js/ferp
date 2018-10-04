import test from 'ava';
import sinon from 'sinon';

import { stateManager } from './stateManager.js';

test('exposes set, get, and onChange', (t) => {
  const manager = stateManager();
  t.is(typeof manager.set, 'function');
  t.is(typeof manager.get, 'function');
  t.is(typeof manager.onChange, 'function');
});

test('initializes with undefined state', (t) => {
  const manager = stateManager();
  t.is(typeof manager.get(), 'undefined');
});

test('sets the state using the set method', (t) => {
  const manager = stateManager();
  const initialState = { foo: 'bar' };
  manager.set(initialState);
  t.is(manager.get(), initialState);
});

test('calls the callback if specified', (t) => {
  const manager = stateManager();
  const initialState = { foo: 'bar' };
  const onChange = sinon.fake();
  manager.set(initialState);
  t.is(onChange.callCount, 0);

  manager.onChange(onChange);
  t.is(onChange.callCount, 0);

  manager.set({ foo: 'baz' });
  t.is(onChange.callCount, 1);
});
