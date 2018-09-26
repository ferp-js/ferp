export const every = (message, milliseconds) => (dispatch) => {
  const handle = setInterval(dispatch, milliseconds, message);

  return () => {
    clearInterval(handle);
  };
};
