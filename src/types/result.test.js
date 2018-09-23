import test from 'ava';
import sinon from 'sinon';

import {
  resultTypes,
  nothing,
  pending,
  just,
  error,
  get,
  getWithDefault,
} from './result.js';

const createGetFakes = () => ({
  nothing: sinon.fake.returns('result for nothing here'),
  pending: sinon.fake.returns('result for pending here'),
  just: sinon.fake.returns('result for just here'),
  error: sinon.fake.returns('result for error here'),
});

test('helpers returns correct result formats', (t) => {
  t.deepEqual(nothing(), { type: resultTypes.result, subtype: resultTypes.nothing });
  t.deepEqual(pending(), { type: resultTypes.result, subtype: resultTypes.pending });
  t.deepEqual(just('test'), { type: resultTypes.result, subtype: resultTypes.just, value: 'test' });
  t.deepEqual(error('error'), { type: resultTypes.result, subtype: resultTypes.error, error: 'error' });
});

test('get returns a method that will process a result', (t) => {
  const fakes = createGetFakes();

  t.is(typeof get(fakes.nothing, fakes.pending, fakes.just, fakes.error), 'function');
});

test('get calls nothing callback for a nothing result', (t) => {
  const fakes = createGetFakes();

  const result = get(
    fakes.nothing,
    fakes.pending,
    fakes.just,
    fakes.error,
  )(nothing());

  t.truthy(fakes.nothing.called);
  t.truthy(fakes.pending.notCalled);
  t.truthy(fakes.just.notCalled);
  t.truthy(fakes.error.notCalled);
  t.is(result, 'result for nothing here');
});

test('get calls pending callback for a pending result', (t) => {
  const fakes = createGetFakes();

  const result = get(
    fakes.nothing,
    fakes.pending,
    fakes.just,
    fakes.error,
  )(pending());

  t.truthy(fakes.nothing.notCalled);
  t.truthy(fakes.pending.called);
  t.truthy(fakes.just.notCalled);
  t.truthy(fakes.error.notCalled);
  t.is(result, 'result for pending here');
});

test('get calls just callback for a just result', (t) => {
  const fakes = createGetFakes();

  const result = get(
    fakes.nothing,
    fakes.pending,
    fakes.just,
    fakes.error,
  )(just('test'));

  t.truthy(fakes.nothing.notCalled);
  t.truthy(fakes.pending.notCalled);
  t.truthy(fakes.just.called);
  t.is(fakes.just.getCall(0).args[0], 'test');
  t.truthy(fakes.error.notCalled);
  t.is(result, 'result for just here');
});

test('get calls error callback for an error result', (t) => {
  const fakes = createGetFakes();

  const err = new Error('test');

  const result = get(
    fakes.nothing,
    fakes.pending,
    fakes.just,
    fakes.error,
  )(error(err));

  t.truthy(fakes.nothing.notCalled);
  t.truthy(fakes.pending.notCalled);
  t.truthy(fakes.just.notCalled);
  t.truthy(fakes.error.called);
  t.is(fakes.error.getCall(0).args[0], err);
  t.is(result, 'result for error here');
});

test('get calls just callback for a non-result', (t) => {
  const fakes = createGetFakes();

  const result = get(
    fakes.nothing,
    fakes.pending,
    fakes.just,
    fakes.error,
  )(null);

  t.truthy(fakes.nothing.notCalled);
  t.truthy(fakes.pending.notCalled);
  t.truthy(fakes.just.called);
  t.is(fakes.just.getCall(0).args[0], null);
  t.truthy(fakes.error.notCalled);
  t.is(result, 'result for just here');
});

test('getWithDefault returns a method that will process a result', (t) => {
  t.is(typeof getWithDefault(value => value, () => 'default here'), 'function');
});

test('getWithDefault returns defaultValue on nothing, pending, and error', (t) => {
  const getResult = getWithDefault(value => value, () => 'default here');

  t.is(getResult(nothing()), 'default here');
  t.is(getResult(pending()), 'default here');
  t.is(getResult(error('error here')), 'default here');
});

test('getWithDefault returns just result on nothing, pending, and error', (t) => {
  const getResult = getWithDefault(value => value, () => 'default here');

  t.is(getResult(just('test')), 'test');
});
