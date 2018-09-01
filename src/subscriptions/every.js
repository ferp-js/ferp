const millisecond = (milliseconds, messageType) => (dispatch) => {
  const handle = setInterval(() => {
    dispatch({ type: messageType });
  }, milliseconds);

  return () => {
    clearInterval(handle);
  };
};

const second = (seconds, messageType) => millisecond(seconds * 1000, messageType);
const minute = (minutes, messageType) => second(minutes * 60, messageType);
const hour = (hours, messageType) => minute(hours * 60, messageType);

module.exports = {
  millisecond,
  second,
  minute,
  hour,
};
