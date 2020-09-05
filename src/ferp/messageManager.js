export const messageManager = () => {
  let callback = null;

  const dispatch = (message) => {
    if (typeof callback !== 'function') return undefined;
    try {
      return callback(message);
    } catch (err) {
      console.error('messageManager.dispatch', { callback, message });
      console.error(err);
    }
  };

  const onDispatch = (dispatchFunction) => {
    callback = dispatchFunction;
  };

  return {
    dispatch,
    onDispatch,
  };
};
