const express = require('express');

const router = express.Router();
const usersRoute = require('./user');
const movieRoute = require('./movie');
const { login, createUser } = require('../controllers/user');

const {
  createUserValidate,
  loginValidate,
} = require('../middlewares/validation');

const NotFoundError = require('../errors/not-found-error');
const auth = require('../middlewares/auth');

router.post('/signup', createUserValidate, createUser);

router.post('/signin', loginValidate, login);

router.use(auth);
router.use('/', usersRoute);
router.use('/', movieRoute);

router.all('*', (req, res, next) => {
  next(new NotFoundError('Ресурс не найден'));
});

module.exports = router;
