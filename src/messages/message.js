class Message {
  constructor() {
    this.type = this.constructor.name;
  }
}

Message.isMessage = (message) => message instanceof Message;

Message.process = (typeAndCallback) => (message, state) => {
  const match = typeAndCallback.find(([klass]) => message instanceof klass);
  if (!match || typeof match[1] !== 'function') return [state];
  return match[1](message, state);
};

module.exports = {
  Message,
};
