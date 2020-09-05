/* eslint-disable no-restricted-syntax, no-continue */

function* ofStateGenerator(dispatch, ofState) {
  const generators = [...ofState];
  const completed = [];

  while (true) {
    const state = yield;
    if (typeof state === 'undefined') continue;

    for (const generator of generators) {
      if (completed.indexOf(generator) >= 0) continue;

      const iter = generator.next(state);
      if (iter.done) {
        completed.push(generator);
      }
      if (Array.isArray(iter.value)) {
        for (const message of iter.value) {
          dispatch(message);
        }
      }
    }
  }
}

function* nullGenerator() {
  while (true) {
    yield;
  }
}

export const ofStateManager = (dispatch, initialState, ofState) => {
  if (!ofState) {
    return nullGenerator();
  }

  const generator = ofStateGenerator(dispatch, ofState);
  generator.next();
  generator.next(initialState);

  return {
    next: (state) => generator.next(state),
    return: (state) => {
      for (const g of ofState) {
        g.return(state);
      }
      return generator.return(state);
    },
  };
};
