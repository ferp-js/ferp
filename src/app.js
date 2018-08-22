const { freeze } = require('./freeze');

const app = ({
  subscriptions = [],
  initialState = null,
  initialEffect = null,
  update,
}) => {
  let state = null;
  let subscriptionState = [];

  const updateState = (newState) => {
    if (newState === undefined) return;
    state = freeze(newState);
  }

  const runEffect = (effect) => {
    if (effect instanceof Promise) {
      effect
        .then(dispatch)
        .catch((err) => {
          console.log('error', err);
        });
    }
  };

  const dispatch = (message) => {
    const [newState, effect] = update(message, state);
    updateState(newState);
    runEffect(effect);
  };

  updateState(initialState);
  runEffect(initialEffect);
  dispatch(null);

  const unsubs = subscriptions.map(sub => sub(dispatch));

  return () => {
    unsubs.forEach(unsub => unsub());
  };
};

module.exports = {
  app,
};
