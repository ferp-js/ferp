const http = require('http');

const serverSubscription = (port, messageType) => (dispatch) => {
  const server = http.createServer((request, response) => {
    dispatch({ type: messageType, request, response });
  });

  server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  server.listen(port, () => {
    console.log('+-----------------------------------'); // eslint-disable-line no-console
    console.log('|'); // eslint-disable-line no-console
    console.log(`| Server started on http://localhost:${port}/`); // eslint-disable-line no-console
    console.log('|'); // eslint-disable-line no-console
    console.log('+-----------------------------------'); // eslint-disable-line no-console
  });

  return () => {
    server.close();
  };
};

module.exports = {
  serverSubscription,
};
