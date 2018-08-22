const { freeze } = require('./freeze.js');
const { Message } = require('./types/message.js');
const { Effect } = require('./types/effect.js');

const app = ({
  init,
  update,
  subscriptions = [],
  middleware = [],
}) => {
  let state = null;
  let killSwitch = false;

  const updateWithMiddleware = (middleware || []).reduce((all, method) => {
    return method(all);
  }, update);

  function updateState(newState) {
    if (newState === undefined) return;
    state = freeze(newState);
    subscriptions.forEach(sub => sub.setState(state));
  }

  function runEffect(effect) {
    if (killSwitch) return;

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

  handleUpdate(init());
  subscriptions.forEach(sub => sub.connect(dispatch, state));


  return () => {
    killSwitch = true;
    subscriptions.forEach(sub => sub.onDetach());
  };
};

module.exports = {
  app,
};
