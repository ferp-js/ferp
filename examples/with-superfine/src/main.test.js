const test = require('ava');
const { effects } = require('ferp');
const browserEnv = require('browser-env');
const { update, main } = require('./main.js');

test.before(() => {
  browserEnv(['document']);
});

test('update with SET triggers a new update with the new value', (t) => {
  const initialState = {
    node: null,
    value: 0,
  };
  const message = {
    type: 'SET',
    value: 'value',
  };
  const [state, effect] = update(message, initialState);
  t.deepEqual(state, { node: null, value: 'value' });
  t.deepEqual(effect.type, effects.batch([]).type);
});

test('update with UPDATE_NODE sets the node and value in state', (t) => {
  const initialState = {
    node: null,
    value: 0,
  };
  const message = {
    type: 'UPDATE_NODE',
    node: 'node',
  };
  const [state, effect] = update(message, initialState);
  t.deepEqual(state, { node: 'node', value: 0 });
  t.deepEqual(effect, effects.none());
});

test('update with unhandled message type is a no-op', (t) => {
  const [state, effect] = update({ type: 'TEST' }, 'state');
  t.is(state, 'state');
  t.deepEqual(effect, effects.none());
});

test('creates an app', (t) => {
  const detach = main();
  t.is(typeof detach, 'function');
  detach();
});
