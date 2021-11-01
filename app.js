const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { errors, celebrate, Joi } = require('celebrate');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { login, createUser } = require('./controllers/user');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

mongoose.connect('mongodb://localhost:27017/moviedb');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));
app.use(helmet());
app.use('/', express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(requestLogger);
app.use(limiter);

const randomString = crypto
  .randomBytes(16)
  .toString('hex');
console.log(randomString);

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

app.use('/', require('./routes/users'));
app.use('/', require('./routes/movies'));

app.use('*', (req, res, next) => {
  next(new NotFoundError('Not Found'));
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.dir(err);
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;
  res.status(statusCode).send({ message });
  next();
});

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.listen(8000, () => {
  console.log('Server has been started');
});
