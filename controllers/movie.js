const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ServerError = require('../errors/server-error');
const ForbiddenError = require('../errors/forbidden-error');
const Movie = require('../models/movie');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch(() => {
      next(new ServerError('Ошибка на сервере'));
    });
};

const createMovies = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameEN,
    nameRU,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameEN,
    nameRU,
    owner,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные'));
      } else {
        next(new ServerError('Ошибка на сервере'));
      }
    });
};

const deleteMovies = (req, res, next) => {
  Movie.findById(req.user.id)
    .orFail(() => next(new NotFoundError('Фильм с указанным id не найден')))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        next(new ForbiddenError('Нет прав увдения фильма'));
      } else {
        Movie.findByIdAndRemove(req.params.movieId)
          .then(() => {
            res.status(200).send(movie);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch(next);
};

module.exports = {
  getMovies, createMovies, deleteMovies,
};
