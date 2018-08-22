const { Subscription } = require('../types/subscription.js');

class Every extends Subscription {
  static seconds(seconds, MessageType) {
    return new Every(seconds * 1000, MessageType);
  }

  static second(MessageType) {
    return Every.seconds(1, MessageType);
  }

  static minutes(minutes, MessageType) {
    return Every.seconds(minutes * 60, MessageType);
  }

  static minute(MessageType) {
    return Every.minutes(1, MessageType);
  }

  static hours(hours, MessageType) {
    return Every.seconds(hours * 60, MessageType);
  }

  static hour(MessageType) {
    return Every.hours(1, MessageType);
  }

  constructor(milliseconds, MessageType) {
    super();
    this.milliseconds = milliseconds;
    this.MessageType = MessageType;
    this.interval = null;
  }

  onAttach() {
    this.interval = setInterval(() => {
      this.dispatch(new this.MessageType());
    }, this.milliseconds);
  }

  onDetach() {
    clearInterval(this.interval);
  }
}

module.exports = {
  Every
};
