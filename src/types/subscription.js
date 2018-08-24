const stateKey = Symbol('state');

class Subscription {
  constructor() {
    this.state = null;
    this.dispatch = null;
  }

  connect(dispatch, state) {
    this.dispatch = dispatch;
    this.state = state;
    this.onAttach(state);
  }

  setState(state) {
    const prevState = this.state;
    this.state = state;
    this.onChange(state, prevState);
  }

  cleanup() {
    this.onDetach(this.state);
  }

  onAttach() {}
  onChange() {}
  onDetach() {}
}

module.exports = {
  Subscription,
};
