const dataKey = Symbol('data');
const errorKey = Symbol('error');
const stateKey = Symbol('state');

const states = {
  nothing: Symbol('nothing'),
  pending: Symbol('pending'),
  done: Symbol('done'),
  error: Symbol('error'),
};

export class Result {
  static nothing() {
    return new Result(null, null, states.nothing);
  }

  static pending() {
    return new Result(null, null, states.pending);
  }

  static done(data) {
    return new Result(data, null, states.done);
  }

  static error(error) {
    return new Result(null, error, states.error);
  }

  constructor(data, error, state) {
    this[dataKey] = data;
    this[errorKey] = error;
    this[stateKey] = state;
    if (!Object.values(states).includes(state)) {
      throw new Error('Result state not valid');
    }
  }

  serialize() {
    switch (this[stateKey]) {
      case states.nothing:
        return '<Result Nothing>';
      case states.pending:
        return '<Result Pending>';
      case states.done:
        return `<Result Done ${JSON.stringify(this[dataKey])}>`;
      case states.error:
        return `<Result Error ${JSON.stringify(this[errorKey])}>`;
      default:
        throw new Error('Result state not valid');
    }
  }

  get(onNothing, onPending, onDone, onError) {
    switch (this[stateKey]) {
      case states.nothing:
        return onNothing();
      case states.pending:
        return onPending();
      case states.done:
        return onDone(this[dataKey]);
      case states.error:
        return onError(this[errorKey]);
      default:
        throw new Error('Result state not valid');
    }
  }

  getWithDefault(defaultValue) {
    return this.get(
      () => defaultValue,
      () => defaultValue,
      data => data,
      () => defaultValue,
    );
  }
}
