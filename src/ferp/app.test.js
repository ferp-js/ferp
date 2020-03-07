import test from 'ava';
import { app } from './app.js';
import { none } from './effects/core.js';

test('app throws when missing init and update', (t) => {
  t.throws(() => app());
  t.throws(() => app({}));

  t.notThrows(() => app({ init: [], update: () => [] }));
  t.notThrows(() => app({ init: [0, 'test'], update: () => [] }));
});

test.cb('app calls update immediately with effect', (t) => {
  t.plan(2);

  app({
    init: [0, { type: 'update' }],
    update: (message, state) => {
      t.deepEqual(message, { type: 'update' });
      t.is(state, 0);
      t.end();
      return [state, none()];
    },
  });
});

test('app creates a detach method', (t) => {
  const detach = app({
    init: [null, none()],
    update: () => [null, none()],
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
    init: [false, { type: 'foo' }],
    update: (message, state) => {
      switch (message.type) {
        case 'foo':
          return [true, none()];

        case 'from-sub':
          t.deepEqual(message, { type: 'from-sub', count: 1 });
          t.end();
          return [false, none()];

        default:
          return [state, none()];
      }
    },
    subscribe: (state) => [
      state && [emptySub],
    ],
  });
});

test.cb('app runs subscription without initial effect', (t) => {
  t.plan(1);

  const sub = () => (dispatch) => {
    dispatch({ type: 'FROM_SUB' });
    return () => {};
  };

  app({
    init: [true, none()],
    update: (message, state) => {
      switch (message.type) {
        case 'FROM_SUB':
          t.pass();
          t.end();
          return [state, none()];

        default:
          t.fail('Got an unexpected message');
          t.end();
          return [state, none()];
      }
    },
    subscribe: () => [
      [sub],
    ],
  });
});
