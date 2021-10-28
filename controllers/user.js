const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../errors/not-found-error');
const ServerError = require('../errors/server-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      res.send({
        name: user.name,
        email: user.email,
        _id: user._id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Неккоректные данные'));
      } else if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new ConflictError('Указанный пользователь уже зарегестрирован'));
      } else {
        next(new ServerError('Произошла ошибка'));
      }
    });
};

const userInfo = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;
  User.findByIdAndUpdate(userId, { name, email }, { new: true, runValidators: true })
    .orFail(new NotFoundError('Пользователь с таким id не найден'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Неккоректные данные'));
      } if (err.statusCode === 404) {
        next(new NotFoundError('Пользователь не найден'));
      }
      next(new ServerError('Ошибка на сервере'));
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => {
      next(new UnauthorizedError(`Необходимо авторизоваться: ${err.message}`));
    });
};

const getUserFile = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => next(new NotFoundError('Пользователь с таким id не найден')))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch(next);
};

module.exports = {
  createUser, userInfo, login, getUserFile,
};
