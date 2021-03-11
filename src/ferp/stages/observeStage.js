export const observeStage = (state, effect, annotation, observe) => (action) => {
  if (observe) {
    observe([
      state.get(),
      effect.get(),
    ], annotation);
  }

  return action;
};
