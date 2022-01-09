export const actionStage = (setState) => (props) => {
  const [state, fx] = props.action(props.state);

  if (!fx) {
    const error = new ReferenceError('No effect given');
    error.data = props;
    throw error;
  }

  setState(state);

  return {
    ...props,
    state,
    fx,
  };
};
