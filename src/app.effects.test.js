import test from 'ava';

import * as ferp from './ferp.js';

const { none, batch } = ferp.effects;

const defaultUpdate = (_, state) => [state, none()];

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
    init: () => [null, none()],
    update: (message, state) => {
      t.fail('should not update');
      return [state, none()];
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
    init: () => [null, { type: 'TEST' }],
    update: (message, state) => {
      t.deepEqual(message, { type: 'TEST' });
      t.end();
      return [state, none()];
    },
  });
});

test.cb('an initial mapped set of effects calls update multiple times', (t) => {
  t.plan(3);

  const expectedOrder = ['TEST1', 'TEST2', 'TEST3'];

  createApp({
    init: () => [
      null,
      batch([
        { type: 'TEST1' },
        { type: 'TEST2' },
        { type: 'TEST3' },
      ]),
    ],
    update: (message, state) => {
      const expectedType = expectedOrder.shift();
      t.is(message.type, expectedType);
      if (expectedOrder.length === 0) t.end();

      return [state, none()];
    },
  });
});

test.cb('effects run in a deterministic order', (t) => {
  const expectedOrder = ['TEST3', 'TEST2', 'TEST4', 'TEST1'];
  t.plan(expectedOrder.length);

  createApp({
    init: () => [
      null,
      batch([
        batch([
          { type: 'TEST3' },
          batch([
            { type: 'TEST2' },
            { type: 'TEST4' },
          ]),
        ]),
        { type: 'TEST1' },
      ]),
    ],
    update: (message, state) => {
      const expectedType = expectedOrder.shift();
      t.is(message.type, expectedType);
      if (expectedOrder.length === 0) t.end();

      return [state, none()];
    },
  });
});
