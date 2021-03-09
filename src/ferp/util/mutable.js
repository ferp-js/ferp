export const mutable = (init) => {
  let value = init;

  const get = () => value;
  const set = (nextValue) => { value = nextValue; };

  return { get, set };
};

