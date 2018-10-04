export const messageManager = () => {
  let callback = null;

  const dispatch = (message) => {
    if (typeof callback !== 'function') return Promise.reject();
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!callback) {
          resolve(message);
        } else {
          resolve(callback(message));
        }
      }, 0);
    });
  };

  const onDispatch = (dispatchFunction) => {
    callback = dispatchFunction;
  };

  return {
    dispatch,
    onDispatch,
  };
};
