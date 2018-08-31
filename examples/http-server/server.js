const ferp = require('../../src/ferp.js');
const { serverSubscription } = require('./subscription.js');
const url = require('url');



class Routable extends ferp.extras.types.Message {
  constructor(request, response) {
    super();
    this.request = request;
    this.response = response;
  }

  toConnection() {
    return {
      request: this.request,
      response: this.response,
    }
  }
}

class Welcome extends Routable {
  static integrate(message, state) {
    return [
      state,
      new ferp.types.Effect((done) => {
        message.response.writeHead(200, { 'Content-Type': 'application/json' });
        message.response.end(JSON.stringify({ hello: 'world' }), done);
      }),
    ];
  }
}

class Logs extends Routable {
  static integrate(message, state) {
    return [
      state,
      new ferp.types.Effect((done) => {
        message.response.writeHead(200, { 'Content-Type': 'application/json' });
        message.response.end(JSON.stringify(state.logs), done);
      }),
    ];
  }
}

class FourOhFour extends Routable {
  static integrate(message, state) {
    const conn = message.toConnection();

    return [
      state,
      new ferp.types.Effect((done) => {
        message.response.writeHead(404, { 'Content-Type': 'application/json' });
        message.response.end(JSON.stringify({ error: 'page not found' }), done);
      }),
    ];
  }
}

class Router extends Routable {
  static requestToRoute(request) {
    const parsed = url.parse(request.url);
    return `${request.method.toUpperCase()} ${parsed.pathname}`;
  }

  static integrate(message, state, routes) {
    const route = Router.requestToRoute(message.request);
    const RouteMessage = routes[route] || FourOhFour;
    const log = `${(new Date()).toISOString()} ${message.request.socket.address().address} ${route} -> <${RouteMessage.name}>`;

    return [
      {
        logs: [log].concat(state.logs),
      },
      new ferp.types.Effect((done) => done(new RouteMessage(message.request, message.response))),
    ]
  }

  static process(routes, Fallback) {
    const types = [Router].concat(Object.values(routes), Fallback);
    return (message, state) => {
      if (!message instanceof Routable) return [state, ferp.types.Effect.none()];
      const Type = types.find(Klass => message instanceof Klass);
      if (!Type) return [state, ferp.types.Effect.none()];
      return Type.integrate(message, state, routes);
    };
  }
}

ferp.app({
  init: () => [
    {
      logs: [],
    },
  ],

  update: Router.process({
    'GET /': Welcome,
    'GET /logs': Logs,
  }, FourOhFour),

  subscribe: () => [
    ['server', serverSubscription, 8080, Router],
  ],

  middleware: [ferp.middleware.logger(2)],
});

