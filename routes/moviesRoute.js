const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.get("/", function (req, res) {
  fetch("https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=2dd412e3756049df0163f542e7863598")
    .then(async response => {
      const moviesData = await response.json()
      res.render('movies', {
        title: 'Movies',
        moviesData
      });
    })
});

router.get("/genres", function (req, res) {
  fetch("https://api.themoviedb.org/3/genre/movie/list?api_key=2dd412e3756049df0163f542e7863598")
    .then(async response => {
      const genresData = await response.json()
      res.render('filter', {
        title: 'Genres',
        genresData
      });
    })
});

router.get("/search", function (req, res) {
  fetch(`https://api.themoviedb.org/3/search/movie?query=${req.query.query}&api_key=2dd412e3756049df0163f542e7863598`)
    .then(async response => {
      const moviesData = await response.json()
      res.render('results', {
        title: 'Movies',
        query: req.query.query,
        moviesData: moviesData.results
      });
    })
});


router.get("/genres/:name/:id", function (req, res) {
  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=2dd412e3756049df0163f542e7863598&sort_by=popularity.desc&with_genres=${req.params.id}`)
    .then(async response => {
      const moviesData = await response.json()
      res.render('filterResults', {
        title: `Genere ${req.params.id}`,
        moviesData: moviesData.results,
        genreName: req.params.name
      });
    })
});

router.get("/:id", function (req, res) {
  Promise.all([
    fetch(
      `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=2dd412e3756049df0163f542e7863598`
    ).then(response => response.json()),
    fetch(
      `https://api.themoviedb.org/3/movie/${req.params.id}/videos?api_key=2dd412e3756049df0163f542e7863598`
    ).then(response => response.json())
  ]).then(([details, videos]) => {
    res.render("movie", {
      title: details.original_title,
      movie: {
        ...details,
        videos: videos.results
      }
    });
  });
});

module.exports = router;