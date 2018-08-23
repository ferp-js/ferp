const frp = require('../../src/frp.js');
const http = require('http');
const { Message, Effect, Result } = frp.types;

class ServerSubscription extends frp.types.Subscription {
  constructor(port, RequestMessage) {
    super();

    this.port = port;

    this.server = http.createServer((request, response) => {
      if (this.dispatch) {
        this.dispatch(new RequestMessage(request, response));
      }
    });

    this.server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
  }

  onAttach() {
    this.server.listen(this.port);
  }

  onDetach() {
    this.server.close();
  }
}

module.exports = {
  ServerSubscription,
};
