import { runEffect } from '../ferp/stages/effectStage.js';
import { act, effectTypes } from '../ferp/effects/core.js';

export const tester = (initialState = {}) => {
  const expectations = [];
  const hit = [];
  const missed = [];
  let ignoreNone = true;
  let state = initialState;

  const fxToString = (fx) => `${fx.type.toString()}:${fx.annotation || '_unset_'}`;

  const manageExpectations = (fx) => {
    if (fx.completed) return fx;
    if (ignoreNone && fx.type === effectTypes.none) return fx;

    hit.push(fxToString(fx));

    const expectationIndex = expectations.findIndex((e) => (
      e.type === fx.type
      && e.annotation == fx.annotation // eslint-disable-line eqeqeq
    ));

    if (expectationIndex >= 0) {
      expectations.splice(expectationIndex, 1);
    }

    if (expectationIndex === -1) {
      missed.push(fxToString(fx));
    }

    return { ...fx, completed: true };
  };

  const run = (dispatch, fx) => runEffect(dispatch, fx, manageExpectations);

  const dispatch = (action, annotation) => {
    const [nextState, nextEffect] = action(state);
    state = nextState;

    manageExpectations(act(action, annotation || action.alias || action.name));

    return run(dispatch, nextEffect);
  };

  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

  const dispatcher = {
    includeEffectNone: () => {
      ignoreNone = false;
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

    willNone: (annotation) => {
      expectations.push({ type: effectTypes.none, annotation });
      return dispatcher;
    },

    fromEffect: async (fx) => {
      await run(dispatch, manageExpectations(fx));
      await tick();
      return dispatcher;
    },

    fromAction: async (action, annotation) => {
      dispatch(action, annotation);
      await tick();
      return dispatcher;
    },

    fromSubscription: ([subFx, ...props]) => ({
      ...dispatcher,
      cancel: subFx(dispatch, ...props),
    }),

    ok: () => expectations.length === 0,

    failedOn: () => expectations.map(fxToString),

    hit: () => hit,

    missed: () => missed,

    state: () => state,
  };

  return dispatcher;
};
