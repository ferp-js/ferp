const test = require('ava');
const { effects, subscriptions } = require('ferp');
const { update, subscribe, main } = require('./main.js');

test('update increases the state with an INCREMENT message, and has no side-effects', (t) => {
  const [nextState, nextEffects] = update('INCREMENT', 0);
  t.is(nextState, 1);
  t.deepEqual(nextEffects, effects.none());
});

test('update is a no-op with any non-INCREMENT message', (t) => {
  const [nextState, nextEffects] = update('whatever', 0);
  t.is(nextState, 0);
  t.deepEqual(nextEffects, effects.none());
});

test('subscribe adds a subscription when the state value is less than 5', (t) => {
  const results = subscribe(0);
  t.deepEqual(results, [
    [subscriptions.every, 'INCREMENT', 1000],
  ]);
});

test('subscribe removes subscription when the state value is 5 or more', (t) => {
  const results = subscribe(5);
  t.deepEqual(results, [
    false,
  ]);
});

test('main creates the app', (t) => {
  const detach = main();
  t.is(typeof detach, 'function');
  detach();
});
