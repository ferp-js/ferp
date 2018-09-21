import test from 'ava';
import sinon from 'sinon';

import {
  millisecond,
  second,
  minute,
  hour,
} from './delay.js';

test.before((t) => {
  t.context.fake = sinon.fake((cb, time, arg) => { // eslint-disable-line no-param-reassign
    cb(arg);
  });
  sinon.replace(global, 'setTimeout', t.context.fake);
});

test.after(() => {
  sinon.restore();
});

test('operations invoke setTimeout with correct delay', async (t) => {
  const message = { type: 'test' };

  await millisecond(100, message).promise;
  t.deepEqual(t.context.fake.lastCall.args.slice(1), [100, message]);

  await second(100, message).promise;
  t.deepEqual(t.context.fake.lastCall.args.slice(1), [100000, message]);

  await minute(100, message).promise;
  t.deepEqual(t.context.fake.lastCall.args.slice(1), [6000000, message]);

  await hour(100, message).promise;
  t.deepEqual(t.context.fake.lastCall.args.slice(1), [360000000, message]);
});
