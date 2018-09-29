export const messageManager = () => {
  const messages = [];
  let callback = null;
  let active = false;

  const runMessage = () => {
    if (messages.length === 0 || typeof callback !== 'function') {
      active = false;
      return;
    }
    active = true;
    const message = messages.shift();
    callback(message)
      .then(() => {
        setTimeout(runMessage, 0);
      });
  };

  const runMessages = () => {
    if (active || typeof callback !== 'function') return;
    runMessage();
  };

  const dispatch = (message) => {
    messages.push(message);
    runMessages();
  };

  const onDispatch = (dispatchFunction) => {
    callback = dispatchFunction;
    runMessages();
  };

  return {
    dispatch,
    onDispatch,
  };
};
