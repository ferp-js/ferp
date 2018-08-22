const { app, Message, subscriptions } = require('../src/frp.js');

class IncrementBy extends Message {
  constructor(value = 1) {
    super();
    this.value = value;
  }
}

const log = next => (message, state) => {
  const result = next(message, state);
  console.log(...result);
  return result;
};

const detach = app({
  initialState: 0,

  update: log(Message.process([
    [IncrementBy, (message, state) => [
      state + message.value,
    ]],
  ])),

  subscriptions: [
    subscriptions.every.milliseconds(100, () => new IncrementBy(1))
  ],
});

setTimeout(detach, 5000);
