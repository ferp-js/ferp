import test from 'ava';
import { tester as ferpTester } from './index.js';
import * as effects from '../ferp/effects/core.js';

test('shallow testing', async (t) => {
  const deepAction = (state) => [state, effects.none()];
  const action = (state) => [{ state: state.counter + 1 }, effects.act(deepAction)];

  const tester = await ferpTester({ counter: 0 })
    .willAct('action')
    .willAct('deepAction')
    .fromAction(action);

  t.falsy(tester.ok());
  t.deepEqual(tester.failedOn(), [
    { type: effects.effectTypes.act, annotation: 'deepAction' },
  ]);
});

test('deep testing', async (t) => {
  const deepAction = (state) => [state, effects.none()];
  const action = (state) => [{ state: state.counter + 1 }, effects.act(deepAction)];

  const tester = await ferpTester({ counter: 0 })
    .resolveAllEffects()
    .willThunk('init')
    .willAct('action')
    .willAct('deepAction')
    .fromEffect(effects.thunk(() => effects.act(action), 'init'));

  t.truthy(tester.ok());
});

test('will wait for promises to resolve', async (t) => {
  const action = state => [state, effects.none()];
  const delay = (action) => effects.defer((resolve) => setTimeout(
    () => resolve(effects.act(action)),
    100,
  ));

  const tester = await ferpTester()
    .resolveAllEffects()
    .willDefer()
    .willAct('action')
    .fromEffect(delay(action));

  t.truthy(tester.ok());
});
