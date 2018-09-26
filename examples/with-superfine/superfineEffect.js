const { batch, defer } = require('ferp').effects;

const superfineEffect = (render, state, message) => {
  let dispatch = () => {};
  const eventPromise = new Promise((eventResolve) => {
    dispatch = eventResolve;
  });

  const node = render(state, dispatch);

  return batch([
    Object.assign({ node }, message),
    defer(eventPromise),
  ]);
};

module.exports = {
  superfineEffect,
};
