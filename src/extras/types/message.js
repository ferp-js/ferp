const { Effect } = require('../../types/effect.js');

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
    return message instanceof Type;
  }

  static process(types) {
    console.log('process', types);
    return (message, state) => {
      console.log('process.inner', message, state);
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
