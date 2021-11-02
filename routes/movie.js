const router = require('express').Router();

const { getMovies, createMovies, deleteMovies } = require('../controllers/movie');
const {
  MovieValidation,
  MovieIdValidation,
} = require('../middlewares/validation');

router.post('/movies', MovieValidation, createMovies);

router.get('/movies', getMovies);

router.delete('/movies/:movieId', MovieIdValidation, deleteMovies);

module.exports = router;
