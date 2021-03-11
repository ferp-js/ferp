import test from 'ava';
import sinon from 'sinon';
import { none } from '../effects/core.js';
import { mutable } from '../util/mutable.js';
import { observeStage } from './observeStage.js';

test('does nothing if action is not given', (t) => {
  const state = mutable();
  const effect = mutable();
  const myAction = () => [];

  const result = observeStage(state, effect)(myAction);

  t.deepEqual(result, myAction);
});

test('calls observe with the state-effect tuple, and the current action name', (t) => {
  const state = mutable('state');
  const effect = mutable(none());
  const myAction = () => [];
  const observe = sinon.fake();

  observeStage(state, effect, observe)(myAction);

  t.truthy(observe.calledOnceWithExactly(['state', none()], 'myAction'));
});

test('calls observe with the state-effect tuple, but fills in anonymous action name', (t) => {
  const state = mutable('state');
  const effect = mutable(none());
  const observe = sinon.fake();

  observeStage(state, effect, observe)(() => [null, none()]);

  t.truthy(observe.calledOnceWithExactly(['state', none()], 'AnonymousAction'));
});
