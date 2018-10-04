import test from 'ava';

import * as ferp from '../ferp.js';

const { none, batch, defer } = ferp.effects;

const defaultUpdate = (_, state) => [state, none()];

const createApp = args => ferp.app({
  init: args.init,
  update: args.update || defaultUpdate,
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
    init: [null, none()],
    update: (message, state) => {
      t.fail('should not update');
      return [state, none()];
    },
  });
});

test.cb('initial effect calls update', (t) => {
  t.plan(1);

  createApp({
    init: [null, { type: 'TEST' }],
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
    init: [
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
    init: [
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

test.cb('deferred effects run later', (t) => {
  const laterMessage = { type: 'from promise' };
  createApp({
    init: [
      null,
      defer(new Promise(resolve => resolve(laterMessage))),
    ],
    update: (message, state) => {
      t.deepEqual(message, laterMessage);
      t.end();

      return [state, none()];
    },
  });
});

test('detaching app cleans up subscriptions, and prevents further dispatches', async (t) => {
  let didDetach = false;
  const detach = createApp({
    init: [
      null,
      'keep going',
    ],
    update: (message, state) => {
      if (didDetach) t.fail('Detached, but updates are still active');
      return [state, 'keep going'];
    },
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  detach();
  // Allow tick for next effects to get new dispatch
  await new Promise(resolve => setTimeout(resolve, 0));
  didDetach = true;
  t.pass('Detach prevented further dispatches');
});
