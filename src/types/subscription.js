const stateKey = Symbol('state');

class Subscription {
  constructor() {
    this.state = null;
    this.dispatch = null;
  }

  connect(dispatch, state) {
    this.dispatch = dispatch;
    this.state = state;
    this.onAttach();
  }

  setState(state) {
    this.state = state;
    this.onChange();
  }

  onAttach() {}
  onChange() {}
  onDetach() {}
}

module.exports = {
  Subscription,
};
