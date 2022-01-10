export const actionStage = (setState) => (props) => {
  const [state, effect] = props.action(props.state);

  if (!effect) {
    const error = new ReferenceError('No effect given');
    error.data = props;
    throw error;
  }

  setState(state);

  return {
    ...props,
    state,
    effect,
  };
};
