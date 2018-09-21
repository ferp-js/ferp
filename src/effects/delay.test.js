import test from 'ava';
import sinon from 'sinon';

import * as core from './core.js';

import * as delay from './delay.js';

test.before((t) => {
  t.context.spy = sinon.spy(global, 'setTimeout'); // eslint-disable-line no-param-reassign
  t.log(t.context.spy);
});

test.after((t) => {
  t.context.spy.restore();
});

test('exports millisecond, second, minute, hour, and raf', (t) => {
  t.deepEqual(Object.keys(delay), [
    'millisecond',
    'second',
    'minute',
    'hour',
  ]);
});

test('millisecond returns a defer effect', (t) => {
  t.is(delay.millisecond().type, core.effectTypes.defer);
});

test('millisecond resolves the correct message', async (t) => {
  t.deepEqual(await delay.millisecond(0, 'test').promise.then(message => message), 'test');
  t.truthy(t.context.spy.called);
});
