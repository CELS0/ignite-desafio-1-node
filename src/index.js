const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find(user => user.username == username);

  if (user) {

      req.user = user;
      return next();
  }
  return res.status(404).json({
      error: "Unauthorized",
  });}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const userExists = users.find(user => user.username === username);

  if (userExists) {
      res.status(400).json({ error: "User already exists" })
  }

  const user = {
      id: uuidv4(),
      name,
      username,
      todos: [],
  }

  users.push(user);

  res.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;

  res.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
  }
  user.todos.push(todo);

  res.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { id } = req.params;
  const { user } = req;

  const todoResult = user.todos.find(todo => todo.id === id);

  if (!todoResult) {
      res.status(404).json({ error: "Todo not already exists" })
  }


  todoResult.title = title;
  todoResult.deadline = deadline;

  res.status(200).json(todoResult);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todoResult = user.todos.find(todo => todo.id === id);

  if (!todoResult) {
      res.status(404).json({ error: "Todo not already exists" })
  }

  todoResult.done = true;

  res.status(200).json(todoResult);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const possition = user.todos.findIndex(todo => todo.id === id);

  if (possition === -1) {
      res.status(404).json({ error: "Todo not already exists" })
  }

  user.todos.splice(possition, 1);

  res.status(204).json({ message: "deleted"});
});

module.exports = app;