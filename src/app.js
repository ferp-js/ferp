const app = ({ initialState = {}, update, events = {} }) => {
  /*
   * initialState - a variable representing the current app state
   * update - user supplied method to deal with update messages
   * afterUpdate - method called after one or more updates have been applied
   *
   */
  let state = initialState;

  const dispatch = (message) => {
    const [newState, effect] = update(message, state);
    state = newState;
    event('update');

    if (effect instanceof Promise) {
      effect
        .then(dispatch)
        .catch((err) => {
          event('error', err);
        });
    }
  };

  const event = (type, params) => {
    if (typeof events[type] !== 'function') return;
    return events[type]({ state, params, dispatch });
  };

  return event('create');
};

module.exports = {
  app,
};
