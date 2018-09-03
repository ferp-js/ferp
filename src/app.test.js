const test = require('ava');
const sinon = require('sinon');
const { app } = require('./app.js');
const { Effect } = require('./types/effect.js');

test('app throws when missing init and update', (t) => {
  t.throws(() => app());
  t.throws(() => app({}));

  t.throws(() => app({ init: () => {} }));

  // This does throw, but later. Not sure how to capture that
  // t.throws(() => app({ init: () => [0, Effect.immediate('test')] }));

  t.notThrows(() => app({ init: () => [], update: () => [] }));
  t.notThrows(() => app({ init: () => [0, Effect.immediate('test')], update: () => [] }));
});

test.cb('app calls update immediately with effect', (t) => {
  t.plan(2);

  app({
    init: () => [0, Effect.immediate({ type: 'update' })],
    update: (message, state) => {
      t.deepEqual(message, { type: 'update' });
      t.is(state, 0);
      t.end();
      return [state, Effect.none()];
    },
  });
});

test('app creates a detach method', (t) => {
  const detach = app({
    init: () => [],
  });
  t.is(typeof detach, 'function');
});

test.cb('app can enable a subscription which can dispatch an update', (t) => {
  const emptySub = () => (dispatch) => {
    let count = 0;
    const handle = setInterval(() => {
      count += 1;
      dispatch({ type: 'from-sub', count });
    }, 100);
    return () => {
      clearInterval(handle);
    };
  };
  app({
    init: () => [false, Effect.immediate({ type: 'foo' })],
    update: (message, state) => {
      switch (message.type) {
        case 'foo':
          return [true, Effect.none()];

        case 'from-sub':
          t.deepEqual(message, { type: 'from-sub', count: 1 });
          t.end();
          return [false, Effect.none()];

        default:
          return [state, Effect.none()];
      }
    },
    subscribe: state => [
      state && ['test', emptySub],
    ],
  });
});

test.cb('app can use middleware', (t) => {
  t.plan(2);
  const testMiddleware = next => sinon.fake((message, state) => {
    t.deepEqual(message, { type: 'foo' });
    t.is(state, true);
    t.end();
    return next(message, state);
  });

  app({
    init: () => [true, Effect.immediate({ type: 'foo' })],
    update: (message, state) => {
      switch (message.type) {
        case 'foo':
          return [true, Effect.none()];

        default:
          return [state, Effect.none()];
      }
    },
    middleware: [testMiddleware],
  });
});
