export const actionStage = (state, effect) => (action) => {
  const [nextState, nextEffect] = action(state.get());

  state.set(nextState);
  effect.set(nextEffect);

  return action;
};
