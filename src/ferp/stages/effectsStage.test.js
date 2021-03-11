import test from 'ava';
import sinon from 'sinon';

import { none, act } from '../effects/core.js';
import { effectStage } from './effectStage.js';
import { log } from '../util/log.js';
import { mutable } from '../util/mutable.js';

test.before((t) => {
  t.context.testLog = { log: sinon.fake(), error: sinon.fake(), warn: sinon.fake() };
  log.setParent(t.context.testLog);
});

test.after(() => {
  log.setParent();
});

test('reports a deprecation warning when an action-function is dispatched', (t) => {
  const dispatch = sinon.fake();
  const action = {};

  const actionFn = () => [null, none()];
  const effect = mutable(actionFn);

  const result = effectStage(effect, dispatch)(action);

  t.deepEqual(action, result);

  t.is(t.context.testLog.warn.callCount, 2);
  t.truthy(t.context.testLog.warn.calledWith('DEPRECATION'));
  t.truthy(dispatch.calledOnceWithExactly(act(actionFn)));
});
