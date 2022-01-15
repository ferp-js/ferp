import test from 'ava';
import * as sinon from 'sinon';
import { tester as ferpTester } from './index.js';
import * as effects from '../ferp/effects/core.js';
import { sub } from '../ferp/subscriptions/core.js';

test('deep testing', async (t) => {
  const deepAction = (state) => [state, effects.none()];
  const action = (state) => [{ state: state.counter + 1 }, effects.act(deepAction)];

  const tester = await ferpTester({ counter: 0 })
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
    .willBatch('multi')
    .willAct('action1')
    .willAct('action2')
    .willAct('action3')
    .fromEffect(effects.batch([
      effects.act(action1),
      effects.act(action2),
      effects.act(action3),
    ], 'multi'));

  t.truthy(tester.ok());

  t.deepEqual(tester.missed(), []);
  t.deepEqual(tester.failedOn(), []);
});

test('ignores none by default', async (t) => {
  const { ok, failedOn } = await ferpTester()
    .willNone('foo')
    .fromEffect(effects.none('foo'));

  t.falsy(ok());

  t.deepEqual(failedOn(), [
    'Symbol(none):foo',
  ]);
});

test('hits none with opt-in', async (t) => {
  const { ok, failedOn } = await ferpTester()
    .includeEffectNone()
    .willNone('foo')
    .fromEffect(effects.none('foo'));

  t.truthy(ok());
  t.deepEqual(failedOn(), []);
});

test('detects additional effects that could be asserted on', async (t) => {
  const { ok, missed } = await ferpTester()
    .willBatch('batch')
    .fromEffect(effects.batch([
      effects.thunk(() => effects.none(), 'thunk'),
      effects.act((state) => [state, effects.none()], 'act'),
    ], 'batch'));

  t.truthy(ok());
  t.deepEqual(missed(), [
    'Symbol(thunk):thunk',
    'Symbol(act):act',
  ]);
});

test('fromAction will detect action name from annotation, alias, or name', async (t) => {
  let result = { ok: () => false };

  result = await ferpTester().willAct('foo').fromAction(((s) => [s, effects.none()]), 'foo');
  t.log({ missed: result.missed(), failedOn: result.failedOn() });
  t.truthy(result.ok(), 'from annotation');

  const actionWithAlias = (s) => [s, effects.none()];
  actionWithAlias.alias = 'foo';
  result = await ferpTester().willAct('foo').fromAction(actionWithAlias);
  t.truthy(result.ok(), 'from alias');

  result = await ferpTester().willAct('foo').fromAction(function foo(s) {
    return [s, effects.none()];
  });
  t.truthy(result.ok(), 'from name');
});

test('reports all hits', async (t) => {
  const { hit } = await ferpTester()
    .fromEffect(effects.batch([
      effects.thunk(() => {
        return effects.batch([
          effects.act(() => [null, effects.none()], 'act1'),
        ], 'batch2');
      }, 'thunk1'),
      effects.act(() => [null, effects.none()], 'act2'),
    ], 'batch1'));

  t.deepEqual(hit(), [
    'Symbol(batch):batch1',
    'Symbol(thunk):thunk1',
    'Symbol(batch):batch2',
    'Symbol(act):act1',
    'Symbol(act):act2',
  ]);
});

test('tracks state', async (t) => {
  const initialState = { count: 0 };
  const incrementCount = s => [{ ...s, count: s.count + 1 }, effects.none()];

  const { ok, state } = await ferpTester(initialState)
    .willAct('incrementCount')
    .fromAction(incrementCount);

  t.truthy(ok());

  t.deepEqual(state(), { count: 1 });
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
    .willAct('onClick')
    .fromSubscription(sub(mySub, element, action));

  t.is(typeof tester.cancel, 'function');

  t.truthy(element.addEventListener.calledOnceWith('click', sinon.match.any));
  t.falsy(tester.ok(), 'pending actions');

  handler();

  t.truthy(tester.ok(), 'all expected actions happened');

  tester.cancel();

  t.truthy(element.removeEventListener.calledOnceWith('click', sinon.match.any));
});
