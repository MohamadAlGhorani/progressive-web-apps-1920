const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
require("dotenv").config();

const apiUrl = "https://api.themoviedb.org/3/"

router.get("/", function (req, res, next) {
  Promise.all([
    fetch(
      `${apiUrl}discover/movie?sort_by=popularity.desc&api_key=${process.env.movieDbKey}`
    ).then(response => response.json()),
    fetch(
      `${apiUrl}movie/top_rated?api_key=${process.env.movieDbKey}&language=en-US&page=1`
    ).then(response => response.json()),
    fetch(
      `${apiUrl}movie/upcoming?api_key=${process.env.movieDbKey}&language=en-US&page=1`
    ).then(response => response.json()),
    fetch(
      `${apiUrl}movie/now_playing?api_key=${process.env.movieDbKey}&language=en-US&page=1`
    ).then(response => response.json())
  ]).then(([popular, topRated, upcoming, nowPlaying]) => {
    res.header('Cache-Control', 'max-age=2592000000');
    next();
    res.render("movies", {
      title: "Movies",
      moviesData: {
        ...popular,
        topRated: topRated.results,
        upcoming: upcoming.results,
        nowPlaying: nowPlaying.results
      }
    });
  });
});

router.get("/offline", function (req, res) {
  res.render("offline", {
    title: "offline"
  });
});

router.get("/genres", function (req, res) {
  fetch(
    `${apiUrl}genre/movie/list?api_key=${process.env.movieDbKey}`
  ).then(async response => {
    const genresData = await response.json();
    res.render("filter", {
      title: "Genres",
      genresData
    });
  });
});

router.get("/search", function (req, res) {
  fetch(
    `${apiUrl}search/movie?query=${req.query.query}&api_key=${process.env.movieDbKey}`
  ).then(async response => {
    const moviesData = await response.json();
    res.render("results", {
      title: "Movies",
      query: req.query.query,
      moviesData: moviesData.results
    });
  });
});

router.get("/genres/:name/:id", function (req, res) {
  fetch(
    `${apiUrl}discover/movie?api_key=${process.env.movieDbKey}&sort_by=popularity.desc&with_genres=${req.params.id}`
  ).then(async response => {
    const moviesData = await response.json();
    res.render("filterResults", {
      title: `Genere ${req.params.id}`,
      moviesData: moviesData.results,
      genreName: req.params.name
    });
  });
});

router.get("/:id", function (req, res) {
  Promise.all([
    fetch(
      `${apiUrl}movie/${req.params.id}?api_key=${process.env.movieDbKey}`
    ).then(response => response.json()),
    fetch(
      `${apiUrl}movie/${req.params.id}/videos?api_key=${process.env.movieDbKey}`
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