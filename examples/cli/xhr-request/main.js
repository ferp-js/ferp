const ferp = require('ferp');
const fetch = require('node-fetch');

const { updateLogger } = require('../common/updateLogger.js');

const {
  batch,
  defer,
  delay,
  none,
} = ferp.effects;

const request = get => (url, number, successType = 'ADD_TODO_OK', failType = 'ADD_TODO_FAIL') => defer(
  get(url)
    .then(response => response.json())
    .then(data => ({ type: successType, data }))
    .catch(err => ({ type: failType, number, error: err })),
);

const fetchTodoItem = number => request(fetch)(
  `https://jsonplaceholder.typicode.com/todos/${number}`,
  number,
);

const update = (message, state) => {
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
};

const main = () => ferp.app({
  init: [
    {
      todo: [],
    },
    batch([4, 2, 5, 3, 1, 7, 6].map(number => (
      fetchTodoItem(number, { type: 'ADD_TODO' })
    ))),
  ],

  update: updateLogger(update),
});

module.exports = {
  request,
  update,
  main,
};
