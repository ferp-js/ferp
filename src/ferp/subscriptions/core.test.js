import test from 'ava';
import sinon from 'sinon';
import * as core from './core.js';

test('can make a subscription with no parameters', (t) => {
  const subFn = () => {};

  t.deepEqual(core.make([subFn]), {
    function: subFn,
    parameters: [],
    cancel: null,
  });
});

test('can make a subscription with parameters', (t) => {
  const subFn = () => {};

  t.deepEqual(core.make([subFn, 'hello', true, 'world', 123]), {
    function: subFn,
    parameters: ['hello', true, 'world', 123],
    cancel: null,
  });
});

test('can start a subscription', (t) => {
  const cancel = () => {};
  const subFn = sinon.fake(() => cancel);
  const idleSub = core.make([subFn]);
  const dispatch = sinon.fake();

  const startedSub = core.start(dispatch)(idleSub);

  t.notDeepEqual(startedSub, idleSub);
  t.is(startedSub.function, idleSub.function);
  t.deepEqual(startedSub.parameters, idleSub.parameters);
  t.truthy(subFn.calledOnceWith(dispatch), 'Subscription started with dispatch parameter');
});
