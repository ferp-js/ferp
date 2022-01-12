export const pipeline = (...fns) => (init) => fns
  .reduce(
    (memo, fn) => fn(memo),
    init,
  );
