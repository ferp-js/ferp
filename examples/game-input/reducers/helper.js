const updatesToStateEffects = (reduced) => {
  const result = Object.keys(reduced).reduce((memo, stateKey) => ({
    state: Object.assign({}, memo.state, { [stateKey]: reduced[stateKey][0] }),
    effects: memo.effects.concat(reduced[stateKey][1]),
  }), { state: {}, effects: [] });

  return [result.state, result.effects];
};

const updatesCollectionToStateEffects = (reduced) => {
  const result = reduced.reduce((memo, subState) => ({
    state: memo.state.concat(subState[0]),
    effects: memo.effects.concat(subState[1]),
  }), { state: [], effects: [] });

  return [result.state, result.effects];
};

module.exports = {
  updatesToStateEffects,
  updatesCollectionToStateEffects,
};
