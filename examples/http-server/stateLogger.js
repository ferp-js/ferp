const stateLogger = update => (message, state) => {
  const result = update(message, state);

  console.log('State:', JSON.stringify(result[0], null, 2)); // eslint-disable-line no-console
  console.log('-----------'); // eslint-disable-line no-console
  console.log(); // eslint-disable-line no-console

  return result;
};

module.exports = {
  stateLogger,
};
