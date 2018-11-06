const MAX_OBJECT_DEPTH = 2;

const shallowCompareObjects = (obj1, obj2, depth) => {
  if (depth > MAX_OBJECT_DEPTH) {
    throw new Error('Ferp does not support object comparison deeper than 2. Consider storing the object for a fast object reference comparison instead.');
  }

  if (obj1 === obj2) {
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length === 0) {
    return obj1 === obj2;
  }

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => (
    shallowCompareObjects(obj1[key], obj2[key], depth + 1)
  ));
};

export const compareArrays = (args1, args2) => {
  if (args1.length !== args2.length) {
    return false;
  }

  if (args1 === args2) {
    return true;
  }

  return args1.every((value, index) => (
    shallowCompareObjects(value, args2[index], 0)
  ));
};
