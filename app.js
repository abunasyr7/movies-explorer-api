const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { errors, celebrate, Joi } = require('celebrate');
const mongoose = require('mongoose');
const usersRoute = require('./routes/users');
const moviesRoute = require('./routes/movies');
const { login, createUser } = require('./controllers/user');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-error');

const app = express();

mongoose.connect('mongodb://localhost:27017/moviedb');
app.use('/', express.json());

const randomString = crypto
  .randomBytes(16)
  .toString('hex');
console.log(randomString);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(4),
    name: Joi.string().min(2).max(30).required(),
  }),
}), createUser);

app.use(auth);
app.use('/', usersRoute);
app.use('/', moviesRoute);
app.use('*', (req, res, next) => {
  next(new NotFoundError('Not Found'));
});
