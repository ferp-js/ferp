import { runEffect } from '../ferp/stages/effectStage.js';
import {
  none, thunk, defer, act, batch, effectTypes,
} from '../ferp/effects/core.js';

export const tester = (initialState = {}) => {
  const expectations = [];
  const missed = [];
  let state = initialState;
  let dispatch = () => {};

  const manageExpectations = (type, annotation) => {
    const expectationIndex = expectations.findIndex((e) => (
      e.type === type
      && e.annotation == annotation // eslint-disable-line eqeqeq
    ));
    if (expectationIndex >= 0) {
      expectations.splice(expectationIndex, 1);
    }

    if (type !== effectTypes.none && expectationIndex === -1) {
      missed.push({
        type: type.toString(),
        annotation,
      });
    }
  };

  const run = (dispatcher, fx) => {
    manageExpectations(fx.type, fx.annotation);
    return runEffect(dispatcher, fx);
  };

  const makeDispatch = (deep) => (action, annotation) => {
    manageExpectations(effectTypes.act, annotation || action.alias || action.name);
    const [nextState, nextEffect] = action(state);
    state = nextState;
    if (deep) {
      return run(dispatch, nextEffect);
    }
    return undefined;
  };

  dispatch = makeDispatch(false);

  const dispatcher = {
    resolveAllEffects: () => {
      dispatch = makeDispatch(true);
      return dispatcher;
    },

    willAct: (annotation) => {
      const fakeAction = (newState) => [newState, none()];
      expectations.push(act(fakeAction, annotation));
      return dispatcher;
    },

    willThunk: (annotation) => {
      const fakeThunk = () => none();
      expectations.push(thunk(fakeThunk, annotation));
      return dispatcher;
    },

    willDefer: (annotation) => {
      const fakeDefer = (resolve) => resolve(none());
      expectations.push(defer(fakeDefer, annotation));
      return dispatcher;
    },

    willBatch: (annotation) => {
      expectations.push(batch([], annotation));
      return dispatcher;
    },

    fromEffect: async (fx) => {
      await run(dispatch, fx);
      return dispatcher;
    },

    fromAction: (action) => dispatcher.fromEffect(act(action)),

    fromSubscription: ([subFx, ...props]) => ({
      ...dispatcher,
      cancel: subFx(dispatch, ...props),
    }),

    ok: () => expectations.length === 0,

    failedOn: () => expectations.map((e) => ({ type: e.type, annotation: e.annotation })),

    missed: () => missed,

    state: () => ({ ...state }),
  };

  return dispatcher;
};
