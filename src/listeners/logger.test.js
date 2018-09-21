import test from 'ava';
import sinon from 'sinon';

import { isAbnormalData, format, logger } from './logger.js';

test('isAbnormalData checks for objects that are not serializable by json', (t) => {
  const normalData = ['', null, undefined, 1, true, 1, {}, []];
  normalData.forEach((normal) => {
    t.falsy(isAbnormalData(normal));
  });

  const abnormalData = [new Map(), new Date()];
  abnormalData.forEach((abnormal) => {
    t.truthy(isAbnormalData(abnormal));
  });
});

test('format will output the value given to it', (t) => {
  const normalOutputs = [true, false, null, 1, 'test', {}, []];
  normalOutputs.forEach((value) => {
    const output = format(null, value);
    t.is(output, value);
  });
});

test('format will output the value using a serialize() if provided', (t) => {
  const output = format(null, { foo: 'bar', serialize: () => 'BAZ' });
  t.is(output, '<BAZ>');
});

test('format will output the value class name if available', (t) => {
  class MyType {}
  const output = format(null, new MyType());
  t.is(output, '<MyType>');
});

test('logger will format and log data', (t) => {
  const log = sinon.fake();

  const message = { type: 'test' };
  const state = 1;

  logger(undefined, log)(message, state);
  t.is(log.callCount, 1);
  t.deepEqual(log.getCall(0).args, ['[LOG]', { type: 'test' }, '1']);
});

test('logger will format and log complicated data', (t) => {
  const log = sinon.fake();

  const message = { type: 'test' };
  const state = 1;

  logger(undefined, log)(message, state);
  t.is(log.callCount, 1);
  t.deepEqual(log.getCall(0).args, ['[LOG]', { type: 'test' }, '1']);
});
