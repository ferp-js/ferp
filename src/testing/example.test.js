import test from 'ava';
import * as sinon from 'sinon';
import { tester as ferpTester } from './index.js';
import * as effects from '../ferp/effects/core.js';
import { sub } from '../ferp/subscriptions/core.js';

test('shallow testing', async (t) => {
  const deepAction = (state) => [{ ...state, counter: state.counter + 5 }, effects.none()];
  const action = (state) => [{ ...state, counter: state.counter + 1 }, effects.act(deepAction)];

  const tester = await ferpTester({ counter: 0 })
    .willAct('action')
    .willAct('deepAction')
    .fromAction(action);

  t.falsy(tester.ok());
  t.deepEqual(tester.failedOn(), [
    { type: effects.effectTypes.act, annotation: 'deepAction' },
  ]);
  t.deepEqual(tester.state(), {
    counter: 1,
  });
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
  const action = (state) => [state, effects.none()];
  const delay = (act) => effects.defer((resolve) => setTimeout(
    () => resolve(effects.act(act)),
    100,
  ));

  const tester = await ferpTester()
    .resolveAllEffects()
    .willDefer()
    .willAct('action')
    .fromEffect(delay(action));

  t.truthy(tester.ok());
});

test('will batch actions', async (t) => {
  const action1 = (state) => [state, effects.none()];
  const action2 = (state) => [state, effects.none()];
  const action3 = (state) => [state, effects.none()];

  const tester = await ferpTester({ counter: 0 })
    .resolveAllEffects()
    .willBatch('multi')
    .willAct('action1')
    .willAct('action2')
    .fromEffect(effects.batch([
      effects.act(action1),
      effects.act(action2),
      effects.act(action3),
    ], 'multi'));

  t.truthy(tester.ok());

  t.deepEqual(tester.missed(), [
    { type: 'Symbol(act)', annotation: 'action3' },
  ]);
});

test('can test a subscription', (t) => {
  const mySub = (dispatch, clickElement, onClick) => {
    const clickHandler = () => {
      dispatch(onClick, 'onClick');
    };
    clickElement.addEventListener('click', clickHandler);

    return () => {
      clickElement.removeEventListener('click', clickHandler);
    };
  };

  let handler = () => {};
  const element = {
    addEventListener: sinon.fake((_, fn) => {
      handler = fn;
    }),
    removeEventListener: sinon.fake(() => {
      handler = () => {};
    }),
  };

  const action = (state) => [state, effects.none()];

  const tester = ferpTester()
    .resolveAllEffects()
    .willAct('onClick')
    .fromSubscription(sub(mySub, element, action));

  t.is(typeof tester.cancel, 'function');

  t.truthy(element.addEventListener.calledOnceWith('click', sinon.match.any));
  t.falsy(tester.ok());

  handler();

  t.truthy(tester.ok());

  tester.cancel();
  t.truthy(element.removeEventListener.calledOnceWith('click', sinon.match.any));
});
