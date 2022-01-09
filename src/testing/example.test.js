import test from 'ava';
import { effectTester } from './index.js';
import * as effects from '../ferp/effects/core.js';

test('effectTester does shallow testing', (t) => {
  const deepAction = (state) => [state, effects.none()];
  const action = (state) => [{ state: state.counter + 1 }, effects.act(deepAction)];

  const tester = effectTester({ counter: 0 })
    .willAct(effects.act(action, 'action'))
    .willAct(effects.act(deepAction, 'deepAction'))
    .execute(effects.thunk(() => effects.act(action)), false);

  t.is(tester.remainingExpectations().length, 1);
});

test('effectTester does deep testing', (t) => {
  const deepAction = (state) => [state, effects.none()];
  const action = (state) => [{ state: state.counter + 1 }, effects.act(deepAction)];

  const tester = effectTester({ counter: 0 })
    .willAct(effects.act(action, 'action'))
    .willAct(effects.act(deepAction, 'deepAction'))
    .execute(effects.thunk(() => effects.act(action)), true);

  t.is(tester.remainingExpectations().length, 0);
});
