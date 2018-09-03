const test = require('ava');
const sinon = require('sinon');
const { Effect } = require('./effect.js');

test('Effect wraps a promise', (t) => {
  const effect = new Effect(() => {});
  t.truthy(effect.promise instanceof Promise);
});

test.cb('Effect forwards #then', (t) => {
  t.plan(1);

  const effect = new Effect((done) => { done(1) });

  effect.then((value) => value).then((value) => {
    t.is(value, 1);
    t.end();
  });
});

test.cb('Effect.map returns a method that resolves multiple effects', (t) => {
  t.plan(3);

  const resolver = Effect.map([Effect.immediate(true)]);

  t.is(typeof resolver, 'function');

  const dispatch = sinon.fake((value) => value);
  resolver(dispatch)
    .then((resolved) => {
      t.truthy(Array.isArray(resolved));
      t.deepEqual(resolved, [true]);
      t.end();
    });
});

test('Effect.defer allows the effect to resolve externally', (t) => {
  t.plan(3);
  const result = Effect.defer();
  t.deepEqual(Object.keys(result), ['dispatch', 'effect']);
  t.is(typeof result.dispatch, 'function');
  t.truthy(result.effect instanceof Effect);
});
