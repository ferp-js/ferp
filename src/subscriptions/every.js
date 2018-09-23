export const every = (milliseconds, message) => (dispatch) => {
  const handle = setInterval(dispatch, milliseconds, message);

  return () => {
    clearInterval(handle);
  };
};
