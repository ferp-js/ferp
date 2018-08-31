const ferp = require('../../src/ferp.js');
const http = require('http');
const { Effect, Result } = ferp.types;

const serverSubscription = (port, MessageClass) => (dispatch) => {
  const server = http.createServer((request, response) => {
    dispatch(new MessageClass(request, response));
  });

  server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  server.listen(port);

  return () => {
    server.close();
  }
};

module.exports = {
  serverSubscription,
};
