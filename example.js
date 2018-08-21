const { app, Message, effects } = require('./src/frp.js');

const inOneSecond = effects.delay(1000);

class IncrementBy extends Message {
  constructor(value = 1) {
    super();
    this.value = value;
  }
}

app({
  initialState: 0,

  update: Message.process([
    [IncrementBy, (message, state) => [
      state + message.value,
      inOneSecond(new IncrementBy(state)),
    ]],
  ]),

  events: {
    create: ({ dispatch }) => {
      dispatch(new IncrementBy(1));
    },
    update: ({ state }) => {
      console.log(state);
    },
    error: (args) => console.log('error', args),
  },
});
