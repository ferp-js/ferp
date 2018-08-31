const millisecond = (milliseconds, message) => (dispatch) => {
  const handle = setInterval(() => {
    dispatch(message);
  }, milliseconds);

  return () => {
    clearInterval(handle);
  };
};

const second = (seconds, message) => millisecond(seconds * 1000, message);
const minute = (minutes, message) => second(minutes * 60, message);
const hour = (hours, message) => minute(hours * 60, message);

module.exports = {
  millisecond,
  second,
  minute,
  hour,
};
