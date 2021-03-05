import test from 'ava';
import sinon from 'sinon';
import { subscribe, unsubscribe } from './subscribe.js';

test('accepts state, and can be terminated', (t) => {
  const subscribeFn = () => [];
  const dispatch = () => {};

  const generator = subscribe(dispatch, subscribeFn);

  const firstResult = generator.next({ some: 'state' });
  t.deepEqual(firstResult.value, []);
  t.is(firstResult.done, false);

  unsubscribe(generator);
  const secondResult = generator.next({ some: 'state' });

  t.is(secondResult.done, true);
});

test('can run a subscription', (t) => {
  const cleanup = sinon.fake();
  const run = sinon.fake(() => () => cleanup);
  const dispatch = () => {};

  const subscribeFn = (state) => [state && [run, state]];

  const generator = subscribe(dispatch, subscribeFn);

  generator.next(true);
  t.is(run.calledOnce, true);
  t.is(cleanup.called, false);
  t.is(run.calledWith(dispatch, true), true);

  generator.next(true);
  t.is(run.calledOnce, true);
  t.is(cleanup.called, false);

  generator.next(false);
  generator.next(false);
  t.is(run.calledOnce, true);
  t.is(cleanup.calledOnce, true);

  unsubscribe(generator);
});
