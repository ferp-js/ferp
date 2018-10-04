const { effects } = require('ferp');

const superfineEffect = (render, state, message) => {
  let dispatch = () => {};
  const eventPromise = new Promise((eventResolve) => {
    dispatch = eventResolve;
  });

  const node = render(state, dispatch);

  return effects.batch([
    Object.assign({ node }, message),
    effects.defer(eventPromise),
  ]);
};

module.exports = {
  superfineEffect,
};
