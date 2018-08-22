class Message {
  static integrate(message, state) {
    return [state];
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
      if (!Message.isMessage(message)) return [state];
      const Type = types.find(Klass => Message.matchType(Klass, message));
      if (!Type) return [state];
      return Message.integrateMessage(Type, message, state);
    };
  }
}

module.exports = {
  Message,
};
