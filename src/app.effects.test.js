import test from 'ava';
import sinon from 'sinon';

import * as ferp from './ferp.js';

const { Effect } = ferp.types;

const defaultUpdate = (_, state) => [state, Effect.none()];

const createApp = args => ferp.app({
  init: args.init,
  update: args.update || defaultUpdate,
  middleware: args.middleware || [],
});

test.cb('update does not get called with no init effect', (t) => {
  t.plan(0);

  let timeout = null;
  const callEndSoon = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(t.end, 10);
  };

  callEndSoon();
  createApp({
    init: () => [null, Effect.none()],
    update: (message, state) => {
      t.fail('should not update');
      return [state, Effect.none()];
    },
    middleware: [next => (message, state) => {
      callEndSoon();
      return next(message, state);
    }],
  });
});

test.cb('initial effect calls update', (t) => {
  t.plan(1);

  createApp({
    init: () => [null, Effect.immediate({ type: 'TEST' })],
    update: (message, state) => {
      t.deepEqual(message, { type: 'TEST' });
      t.end();
      return [state, Effect.none()];
    },
  });
});

test.cb('an initial mapped set of effects calls update multiple times', (t) => {
  t.plan(3);

  const expectedOrder = ['TEST1', 'TEST2', 'TEST3'];

  createApp({
    init: () => [
      null,
      Effect.map([
        Effect.immediate({ type: 'TEST1' }),
        Effect.immediate({ type: 'TEST2' }),
        Effect.immediate({ type: 'TEST3' }),
      ]),
    ],
    update: (message, state) => {
      const expectedType = expectedOrder.shift();
      t.is(message.type, expectedType);
      if (expectedOrder.length === 0) t.end();

      return [state, Effect.none()];
    },
  });
});

test.cb('effects run in a deterministic order', (t) => {
  const expectedOrder = ['TEST3', 'TEST2', 'TEST4', 'TEST1'];
  t.plan(expectedOrder.length);

  createApp({
    init: () => [
      null,
      Effect.map([
        Effect.map([
          Effect.immediate({ type: 'TEST3' }),
          Effect.map([
            Effect.immediate({ type: 'TEST2' }),
            Effect.immediate({ type: 'TEST4' }),
          ]),
        ]),
        Effect.immediate({ type: 'TEST1' }),
      ]),
    ],
    update: (message, state) => {
      const expectedType = expectedOrder.shift();
      t.is(message.type, expectedType);
      if (expectedOrder.length === 0) t.end();

      return [state, Effect.none()];
    },
  });
});


test.cb('app reports an incorrect effect', (t) => {
  t.plan(1);

  sinon.stub(console, 'error');

  createApp({
    init: () => [
      null,
      'not an effect',
    ],
    update: () => {},
  });

  setTimeout(() => {
    t.truthy(console.error.called);
    console.error.reset();
    t.end();
  }, 30);
});
