import test from 'ava';
import sinon from 'sinon';
import { observeStage } from './observeStage.js';

test('calls observe with tick props', (t) => {
  const observe = sinon.fake();
  const props = {};

  observeStage(observe)(props);

  t.truthy(observe.calledOnceWithExactly(props));
});
