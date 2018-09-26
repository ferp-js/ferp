const ferp = require('ferp');
const https = require('https');

const { updateLogger } = require('./updateLogger.js');

const { batch, defer, none } = ferp.effects;

const request = (url, number, successType = 'ADD_TODO_OK', failType = 'ADD_TODO_FAIL') => batch([
  defer(new Promise((done) => {
    https.get(url, (response) => {
      let data = '';
      response
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          done({ type: successType, data: JSON.parse(data) });
        });
    })
      .on('error', (err) => {
        done({ type: failType, number, error: err });
      })
      .end();
  })),
]);

const fetchTodoItem = number => request(
  `https://jsonplaceholder.typicode.com/todos/${number}`,
  number,
);

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
      case 'ADD_TODO_OK':
        return [
          {
            todo: state.todo
              .concat(message.data)
              .sort((a, b) => a.id - b.id),
          },
          none(),
        ];

      case 'ADD_TODO_FAIL':
        console.log('fetch error', message.error);
        return [
          state,
          delay(1000, fetchTodoItem(message.number)),
        ];

      default:
        return [
          state,
          none(),
        ];
    }
  }),
});
