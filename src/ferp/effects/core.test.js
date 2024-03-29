import test from 'ava';
import * as core from './core.js';

test('core effects return the correct types', (t) => {
  const types = ['none', 'batch', 'defer'];
  types.forEach((type) => {
    t.is(core[type]().type, core.effectTypes[type]);
  });
});

test('batch has an array of effects', (t) => {
  const effect = core.batch(['a', 'b']);
  t.deepEqual(effect.effects, ['a', 'b']);
});

test('defer can accept a promise', (t) => {
  const effect = core.defer(new Promise((resolve) => resolve()));
  t.truthy(effect.promise instanceof Promise);
});

test('thunk has a method', (t) => {
  const effect = core.thunk(() => ({}));
  t.truthy(typeof effect.method, 'function');
});

test('act has an action', (t) => {
  const effect = core.act((state) => [state, core.none()]);
  t.truthy(typeof effect.action, 'function');
});
