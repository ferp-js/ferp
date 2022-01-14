import { runEffect } from '../ferp/stages/effectStage.js';
import { act, effectTypes } from '../ferp/effects/core.js';

export const tester = (initialState = {}) => {
  const expectations = [];
  const hit = [];
  const missed = [];
  let state = initialState;
  let dispatchFn = () => {};

  const fxToString = (fx) => `${fx.type.toString()}:${fx.annotation || '_unset_'}`;

  const manageExpectations = (fx) => {
    if (!fx) return fx;
    const expectationIndex = expectations.findIndex((e) => (
      e.type === fx.type
      && e.annotation == fx.annotation // eslint-disable-line eqeqeq
    ));

    if (expectationIndex >= 0) {
      hit.push(fxToString(fx));
      expectations.splice(expectationIndex, 1);
    }

    if (expectationIndex === -1) {
      missed.push(fxToString(fx));
    }

    return fx;
  };

  const run = (dispatch, fx) => runEffect(dispatch, fx, manageExpectations);

  const makeDispatch = (deep) => function self(action, annotation) {
    const [nextState, nextEffect] = action(state);
    state = nextState;

    manageExpectations(act(action, annotation || action.alias || action.name));

    if (deep) {
      return run(self, nextEffect);
    }
    return undefined;
  };

  dispatchFn = makeDispatch(false);

  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

  const dispatcher = {
    resolveAllEffects: () => {
      dispatchFn = makeDispatch(true);
      return dispatcher;
    },

    willAct: (annotation) => {
      expectations.push({ type: effectTypes.act, annotation });
      return dispatcher;
    },

    willThunk: (annotation) => {
      expectations.push({ type: effectTypes.thunk, annotation });
      return dispatcher;
    },

    willDefer: (annotation) => {
      expectations.push({ type: effectTypes.defer, annotation });
      return dispatcher;
    },

    willBatch: (annotation) => {
      expectations.push({ type: effectTypes.batch, annotation });
      return dispatcher;
    },

    fromEffect: async (fx) => {
      await run(dispatchFn, fx);
      await tick();
      return dispatcher;
    },

    fromAction: async (action, annotation) => {
      dispatchFn(action, annotation || action.alias || action.name);
      await tick();
      return dispatcher;
    },

    fromSubscription: ([subFx, ...props]) => ({
      ...dispatcher,
      cancel: subFx(dispatchFn, ...props),
    }),

    ok: () => expectations.length === 0,

    failedOn: () => expectations.map(fxToString),

    hit: () => hit,

    missed: () => missed,

    state: () => ({ ...state }),
  };

  return dispatcher;
};
