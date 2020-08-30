import test from 'ava';
import sinon from 'sinon';
import { ofStateManager } from './ofStateManager.js';

const createTestOfStateMiddleware = (initialDone = false) => {
  let done = initialDone;
  const generatorNext = sinon.fake(() => ({ value: null, done }));
  const generatorReturn = sinon.fake(() => {
    done = true;
    return { value: null, done };
  });

  return ({
    next: generatorNext,
    return: generatorReturn,
  });
};

test.before((t) => {
  t.context.testGenerator = createTestOfStateMiddleware(); // eslint-disable-line no-param-reassign
});

test.after((t) => {
  t.context.testGenerator.return();
});

test('will run ofState generators with each state update', (t) => {
  const { testGenerator } = t.context;

  const initialState = {};

  ofStateManager(sinon.fake(), initialState, [
    testGenerator,
  ]);

  t.is(testGenerator.next.callCount, 1);
  t.truthy(testGenerator.next.calledOnceWithExactly(initialState));
});

test('will clean up all generators at termination', (t) => {
  const { testGenerator } = t.context;

  const initialState = {};
  const nextState = { foo: 'bar' };

  const manager = ofStateManager(sinon.fake(), initialState, [
    testGenerator,
  ]);

  manager.return(nextState);

  t.is(testGenerator.return.callCount, 1);
  t.truthy(testGenerator.return.calledWithExactly(nextState));
});

test('will skip next on completed generators', (t) => {
  t.context.testGenerator.return();

  t.context.testGenerator = createTestOfStateMiddleware( // eslint-disable-line no-param-reassign
    true,
  );
  const { testGenerator } = t.context;

  const initialState = {};
  const nextState = { foo: 'bar' };

  const manager = ofStateManager(sinon.fake(), initialState, [
    testGenerator,
  ]);

  manager.next(nextState);

  t.is(testGenerator.next.callCount, 1);
  t.falsy(testGenerator.next.calledWithExactly(nextState));
});
