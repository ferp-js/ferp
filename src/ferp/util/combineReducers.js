import { batch } from '../effects/core.js';

export const combineReducersFromArray = (result) => {
  const { state, effects } = result.reduce((combined, item) => {
    const nextState = [...combined.state];
    nextState.push(item[0]);
    return {
      state: nextState,
      effects: combined.effects.concat(item[1]),
    };
  }, { state: [], effects: [] });

  return [state, batch(effects)];
};

export const combineReducersFromObject = (result) => {
  const { state, effects } = Object.keys(result).reduce((combined, key) => ({
    state: { ...combined.state, [key]: result[key][0] },
    effects: combined.effects.concat(result[key][1]),
  }), { state: {}, effects: [] });

  return [state, batch(effects)];
};

export const combineReducers = (result) => {
  if (Array.isArray(result)) {
    return combineReducersFromArray(result);
  }
  return combineReducersFromObject(result);
};
