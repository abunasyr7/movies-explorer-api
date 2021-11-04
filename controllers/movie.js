const BadRequestError = require('../errors/bad-request-error');
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
  const owner = req.user._id;
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((movie) => {
      if (owner.toString() === movie.owner.toString()) {
        return movie.remove()
          .then(() => res.status(200)
            .send({ message: 'Фильм удалён' }));
      }
      throw new ForbiddenError('Нет прав удаления карточки');
    })
    .catch(next);
};

module.exports = {
  getMovies, createMovies, deleteMovies,
};
