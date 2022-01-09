export const observeStage = (observe) => (props) => {
  if (observe) {
    observe(props);
  }

  return props;
};
