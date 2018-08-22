const dataKey = Symbol('data');
const errorKey = Symbol('error');
const stateKey = Symbol('state');

const states = {
  idle: Symbol('idle'),
  loading: Symbol('loading'),
  done: Symbol('done'),
  error: Symbol('error'),
};

class Result {
  constructor(data, error, state) {
    this[dataKey] = data;
    this[errorKey] = error;
    this[stateKey] = state;
  }

  serialize() {
    switch(this[stateKey]) {
      case states.idle:
        return `Result Idle Nothing`;
      case states.loading:
        return `Result Loading Nothing`;
      case states.done:
        return `Result Done ${JSON.stringify(this[dataKey])}`;
      case states.error:
        return `Result Error ${this[errorKey]}`;

      default:
        throw new Error('Result state not valid');
    }
  }

  static idle() {
    return new Result(null, null, states.idle);
  }

  static loading() {
    return new Result(null, null, states.loading);
  }

  static done(data) {
    return new Result(data, null, states.done);
  }

  static error(error) {
    return new Result(null, error, states.error);
  }

  get(onIdle, onLoading, onDone, onError) {
    switch(this[stateKey]) {
      case states.idle:
        return onIdle();
      case states.loading:
        return onLoading();
      case states.done:
        return onDone(this[dataKey]);
      case states.error:
        return onError(this[errorKey]);
    }
  }
}

module.exports = {
  Result,
};
