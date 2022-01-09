import { runEffect } from '../ferp/stages/effectStage.js';
import { effectTypes, act } from '../ferp/effects/core.js';

export const effectTester = (initialState) => {
  let expectations = [];
  let state = initialState;
  let dispatch = () => {};

  const makeDispatch = (deep) => (action, name) => {
    const expectationIndex = expectations.findIndex(e => (
      e.type === effectTypes.act
      && e.name === name
    ));
    expectations.splice(expectationIndex, 1);
    const [nextState, nextEffect] = action(state);
    state = nextState;
    if (deep) {
      runEffect(dispatch, nextEffect);
    }
  };


  const dispatcher = {
    willAct: (action) => {
      expectations.push(act(action));
      return dispatcher;
    },
    
    execute: (fx, deep = true) => {
      dispatch = makeDispatch(deep);
      runEffect(dispatch, fx);
      return dispatcher;
    },

    remainingExpectations: () => expectations,
  }

  return dispatcher;
};
