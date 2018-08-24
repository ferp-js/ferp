const stateKey = Symbol('state');
const dispatchKey = Symbol('dispatch');

class Subscription {
  constructor() {
    this[stateKey] = null;
    this[dispatchKey] = () => {};
  }

  connect(dispatch, state) {
    this[dispatchKey] = dispatch;
    this[stateKey] = state;
    this.onAttach(state);
  }

  setState(state) {
    const prevState = this[stateKey];
    this[stateKey] = state;
    this.onChange(state, prevState);
  }

  cleanup() {
    this.onDetach(this[stateKey]);
  }

  dispatch(message) {
    this[dispatchKey](message);
  }

  onAttach() {}
  onChange() {}
  onDetach() {}
}

module.exports = {
  Subscription,
};
