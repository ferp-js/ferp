const frp = require('../src/frp.js');
const { Message, Effect } = frp.types;
const { every } = frp.subscriptions;

class IncrementBy extends Message {
  constructor(value = 1) {
    super();
    this.value = value;
  }

  static integrate(message, state) {
    return [
      state + message.value,
      Effect.none(),
    ];
  }
}

const detach = frp.app({
  init: () => [
    0,
    Effect.none(),
  ],

  update: Message.process([
    IncrementBy
  ]),

  subscriptions: [
    every.milliseconds(100, () => new IncrementBy(1))
  ],

  middleware: [frp.middleware.logger()],
});

setTimeout(detach, 5000);
