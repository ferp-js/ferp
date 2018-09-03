import test from 'ava';
import * as Every from './every.js';

test.cb('Every.millisecond dispatches messages', (t) => {
  t.plan(1);
  const detach = Every.millisecond(10, 'test')((message) => {
    detach();
    t.deepEqual(message, { type: 'test' });
    t.end();
  });
});

test('Every exports millisecond, second, minute, and hour', (t) => {
  t.is(typeof Every.millisecond, 'function');
  t.is(typeof Every.second, 'function');
  t.is(typeof Every.minute, 'function');
  t.is(typeof Every.hour, 'function');
});
