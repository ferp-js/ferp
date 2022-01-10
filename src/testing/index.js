import { runEffect } from '../ferp/stages/effectStage.js';
import { none, thunk, defer, act } from '../ferp/effects/core.js';

export const effectTester = (initialState) => {
  let expectations = [];
  let state = initialState;

  const run = (dispatch, fx) => {
    const expectationIndex = expectations.findIndex(e => (
      e.type === fx.type
      && e.annotation == fx.annotation
    ));
    expectations.splice(expectationIndex, 1);
    return runEffect(dispatch, fx);
  };

  const makeDispatch = (deep) => (action, _name) => {
    const [nextState, nextEffect] = action(state);
    state = nextState;
    if (deep) {
      return run(dispatch, nextEffect);
    }
  };


  let dispatch = makeDispatch(false);

  const dispatcher = {
    resolveAllEffects: () => {
      dispatch = makeDispatch(true);
      return dispatcher;
    },

    willAct: (annotation) => {
      const fakeAction = state => [state, none()];
      expectations.push(act(fakeAction, annotation));
      return dispatcher;
    },

    willThunk: (annotation) => {
      const fakeThunk = () => none();
      expectations.push(thunk(fakeThunk, annotation));
      return dispatcher; },

    willDefer: () => {
      const fakeDefer = (resolve) => resolve(none());
      expectations.push(defer(fakeDefer));
      return dispatcher;
    },

    fromEffect: async (fx) => {
      await run(dispatch, fx);
      return dispatcher;
    },

    fromAction: (action) => {
      return dispatcher.fromEffect(act(action));
    },

    ok: () => expectations.length === 0,

    failedOn: () => expectations.map(e => ({ type: e.type, annotation: e.annotation })),
  }

  return dispatcher;
};
