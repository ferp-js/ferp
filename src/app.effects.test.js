import test from 'ava';

import { app, effect } from './ferp.js';

const defaultUpdate = (_, state) => [state, effect.none()];

const createApp = args => app({
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
    init: () => [null, effect.none()],
    update: (message, state) => {
      t.fail('should not update');
      return [state, effect.none()];
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
    init: () => [null, effect.immediate({ type: 'TEST' })],
    update: (message, state) => {
      t.deepEqual(message, { type: 'TEST' });
      t.end();
      return [state, effect.none()];
    },
  });
});

test.cb('an initial mapped set of effects calls update multiple times', (t) => {
  t.plan(3);

  const expectedOrder = ['TEST1', 'TEST2', 'TEST3'];

  createApp({
    init: () => [
      null,
      effect.map([
        effect.immediate({ type: 'TEST1' }),
        effect.immediate({ type: 'TEST2' }),
        effect.immediate({ type: 'TEST3' }),
      ]),
    ],
    update: (message, state) => {
      const expectedType = expectedOrder.shift();
      t.is(message.type, expectedType);
      if (expectedOrder.length === 0) t.end();

      return [state, effect.none()];
    },
  });
});

test.cb('effects run in a deterministic order', (t) => { const expectedOrder = ['TEST3', 'TEST2', 'TEST4', 'TEST1'];
  t.plan(expectedOrder.length);

  createApp({
    init: () => [
      null,
      effect.map([
        effect.map([
          effect.immediate({ type: 'TEST3' }),
          effect.map([
            effect.immediate({ type: 'TEST2' }),
            effect.immediate({ type: 'TEST4' }),
          ]),
        ]),
        effect.immediate({ type: 'TEST1' }),
      ]),
    ],
    update: (message, state) => {
      const expectedType = expectedOrder.shift();
      t.is(message.type, expectedType);
      if (expectedOrder.length === 0) t.end();

      return [state, effect.none()];
    },
  });
});
