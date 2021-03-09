export const pipeline = (...fns) => (init) => fns
  .reduce(
    (memo, fn) => (memo ? fn(memo) : null),
    init,
  );
