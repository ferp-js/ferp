const { freeze } = require('./freeze.js');
const { Message } = require('./types/message.js');
const { Effect } = require('./types/effect.js');

const app = ({
  subscriptions = [],
  init = null,
  update,
  middleware = [],
}) => {
  let state = null;
  let subscriptionState = [];

  const updateWithMiddleware = (middleware || []).reduce((all, method) => {
    return method(all);
  }, update);

  function updateState(newState) {
    if (newState === undefined) return;
    state = freeze(newState);
  }

  function runEffect(effect) {
    if (effect instanceof Effect) {
      return effect
        .then(dispatch)
        .catch((err) => {
          console.log('error', err);
        });
    } else if (typeof effect === 'function') {
      return effect(dispatch);
    }
    return Promise.resolve();
  };

  function handleUpdate([newState, effect]) {
    updateState(newState);
    return runEffect(effect);
  }

  function dispatch(message) {
    return handleUpdate(updateWithMiddleware(message, state));
  };

  if (typeof init === 'function') {
    handleUpdate(init());
  }

  const unsubs = subscriptions.map(sub => sub(dispatch));

  return () => {
    unsubs.forEach(unsub => unsub());
  };
};

module.exports = {
  app,
};
