const test = require('ava');
const { effects } = require('ferp');
const { request, update, main } = require('./main.js');

test('request creates a success message on a successful get', (t) => {
  const get = () => Promise.resolve({ json: () => Promise.resolve('test') });
  const effect = request(get)('some-url-here', 1);
  return effect.promise
    .then((message) => {
      t.deepEqual(message, {
        type: 'ADD_TODO_OK',
        data: 'test',
      });
    });
});

test('request creates a failure message on a bad get', (t) => {
  const error = new Error('test');
  const get = () => Promise.reject(error);
  const effect = request(get)('some-url-here', 1);
  return effect.promise
    .then((message) => {
      t.deepEqual(message, {
        type: 'ADD_TODO_FAIL',
        number: 1,
        error,
      });
    });
});

test('update message ADD_TODO_OK will add and sort the todos by id', (t) => {
  const previousState = {
    todo: [
      { id: 1 },
      { id: 5 },
    ],
  };

  const message = {
    type: 'ADD_TODO_OK',
    data: { id: 4 },
  };

  const [nextState, nextEffects] = update(message, previousState);
  t.deepEqual(nextState, {
    todo: [
      { id: 1 },
      { id: 4 },
      { id: 5 },
    ],
  });
  t.deepEqual(nextEffects, effects.none());
});

test('update message ADD_TODO_FAIL will retry the fetch', (t) => {
  const previousState = {
    todo: [
      { id: 1 },
      { id: 5 },
    ],
  };

  const message = {
    type: 'ADD_TODO_FAIL',
    number: 2,
  };

  const [nextState, nextEffects] = update(message, previousState);
  t.deepEqual(nextState, {
    todo: [
      { id: 1 },
      { id: 5 },
    ],
  });
  t.deepEqual(nextEffects.type, effects.thunk().type);
});

test('update will no-op unhandled messages', (t) => {
  const previousState = {
    todo: [
      { id: 1 },
      { id: 5 },
    ],
  };

  const message = {
    type: 'whatever',
  };

  const [nextState, nextEffects] = update(message, previousState);
  t.deepEqual(nextState, previousState);
  t.deepEqual(nextEffects, effects.none());
});

test('main creates the app', (t) => {
  const detach = main();
  t.is(typeof detach, 'function');
  detach();
});
