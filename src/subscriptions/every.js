export const millisecond = (milliseconds, messageType) => (dispatch) => {
  const handle = setInterval(() => {
    dispatch({ type: messageType });
  }, milliseconds);

  return () => {
    clearInterval(handle);
  };
};

export const second = (seconds, messageType) => millisecond(seconds * 1000, messageType);
export const minute = (minutes, messageType) => second(minutes * 60, messageType);
export const hour = (hours, messageType) => minute(hours * 60, messageType);
