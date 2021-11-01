const router = require('express').Router();
const { isURL } = require('validator');
const { celebrate, Joi } = require('celebrate');
const { getMovies, createMovies, deleteMovies } = require('../controllers/movie');

router.get('/movies', getMovies);

router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().min(2).max(30).required(),
    director: Joi.string().min(2).max(30).required(),
    duration: Joi.number().required(),
    year: Joi.string().min(2).max(30).required(),
    description: Joi.string().min(2).max(30).required(),
    image: Joi.string().required().custom((value) => {
      if (!isURL(value)) {
        throw new Error('Ссылка не корректна');
      }
      return value;
    }),
    trailer: Joi.string().required().custom((value) => {
      if (!isURL(value)) {
        throw new Error('Ссылка не корректна');
      }
      return value;
    }),
    thumbnail: Joi.string().required().custom((value) => {
      if (!isURL(value)) {
        throw new Error('Ссылка не корректна');
      }
      return value;
    }),
    nameRU: Joi.string().min(2).max(30).required(),
    nameEN: Joi.string().min(2).max(30).required(),
  }),
}), createMovies);

router.delete('/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.number().required(),
  }),
}), deleteMovies);

module.exports = router;
