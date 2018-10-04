const test = require('ava');
const { effects } = require('ferp');
const { update, main } = require('./main.js');

test('update increases state value and adds delay', (t) => {
  const [nextState, nextEffects] = update(null, 0);
  t.is(nextState, 1);
  t.notDeepEqual(nextEffects, effects.none());
});

test('update stops when the next state value is greater than or equal to 5', (t) => {
  const [nextState, nextEffects] = update(null, 4);
  t.is(nextState, 5);
  t.deepEqual(nextEffects, effects.none());
});

test('main creates the app', (t) => {
  const detach = main();
  t.is(typeof detach, 'function');
  detach();
});
