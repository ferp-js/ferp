const key = Symbol('data');

class Result {
  constructor(data) {
    this[key] = data;
  }

  set(data) {
    return new Result(data);
  }

  unset() {
    return this.set();
  }

  get(withData, withoutData) {
    const data = this[key];
    if (typeof data !== 'undefined') {
      return withData(data);
    }
    return withoutData();
  }
}

module.exports = {
  Result,
};
