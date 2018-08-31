const http = require('http');

const serverSubscription = (port, messageType) => (dispatch) => {
  const server = http.createServer((request, response) => {
    dispatch({ type: messageType, request, response });
  });

  server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  server.listen(port, () => {
    console.log('+-----------------------------------');
    console.log('|');
    console.log(`| Server started on port ${port}`);
    console.log(`|  * http://localhost:${port}/`);
    console.log(`|  * http://localhost:${port}/logs`);
    console.log('|');
    console.log('+-----------------------------------');
  });

  return () => {
    server.close();
  }
};

module.exports = {
  serverSubscription,
};
