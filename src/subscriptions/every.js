const milliseconds = (milliseconds, messageGenerator) => dispatch => {
  const interval = setInterval(() => {
    dispatch(messageGenerator());
  }, milliseconds);

  return () => {
    clearInterval(interval);
  };
};

module.exports = {
  milliseconds,
};
