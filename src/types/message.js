const { Effect } = require('./effect.js');

class Message {
  static integrate(message, state) {
    return [state, Effect.none()];
  }

  static isMessage(message) {
    return message instanceof Message || typeof message === 'function';
  }

  static integrateMessage(Type, message, state) {
    if (typeof Type.integrate === 'function') {
      return Type.integrate(message, state);
    }
    return Type(message, state);
  }

  static matchType(Type, message) {
    if (typeof message === 'function') return Type.name === message.name;
    return message instanceof Type;
  }

  static process(types) {
    return (message, state) => {
      if (!Message.isMessage(message)) return [state, Effect.none()];
      const Type = types.find(Klass => Message.matchType(Klass, message));
      if (!Type) return [state, Effect.none()];
      return Message.integrateMessage(Type, message, state);
    };
  }
}

module.exports = {
  Message,
};
