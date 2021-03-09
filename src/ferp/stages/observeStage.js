export const observeStage = (state, effect, observe) => (action) => {
  if (observe) {
    observe([
      state.get(),
      effect.get(),
    ], action.name || 'AnonymousAction');
  }

  return action;
};
