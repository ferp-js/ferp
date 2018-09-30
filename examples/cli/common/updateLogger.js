const updateLogger = update => (message, state) => {
  const result = update(message, state);

  console.log('Message:', JSON.stringify(message, null, 2)); // eslint-disable-line no-console
  console.log('State:', JSON.stringify(result[0], null, 2)); // eslint-disable-line no-console
  console.log('-----------\n'); // eslint-disable-line no-console

  return result;
};

module.exports = {
  updateLogger,
};
