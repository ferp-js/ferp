const ferp = require('ferp');
const https = require('https');

const { updateLogger } = require('./updateLogger.js');

const { result } = ferp;
const { batch, defer, none } = ferp.effects;

const request = (url, message) => batch([
  Object.assign({}, message, { data: result.pending() }),
  defer(new Promise((done) => {
    https.get(url, (response) => {
      let data = '';
      response
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          done(Object.assign({ data: result.just(JSON.parse(data)) }, message));
        });
    })
      .on('error', (err) => {
        done(Object.assign({}, message, { data: result.error(err) }));
      })
      .end();
  })),
]);

const fetchTodoItem = (number, message) => request(
  `https://jsonplaceholder.typicode.com/todos/${number}`,
  message,
);

const getTodoItem = result.getWithDefault(value => value, () => []);

ferp.app({
  init: [
    {
      todo: [],
    },
    batch([4, 2, 5, 3, 1, 7, 6].map(number => (
      fetchTodoItem(number, { type: 'ADD_TODO' })
    ))),
  ],

  update: updateLogger((message, state) => {
    switch (message.type) {
      case 'ADD_TODO':
        return [
          {
            todo: state.todo
              .concat(getTodoItem(message.data))
              .sort((a, b) => a.id - b.id),
          },
          none(),
        ];

      default:
        return [
          state,
          none(),
        ];
    }
  }),
});
