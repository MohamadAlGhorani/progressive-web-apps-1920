const express = require("express");
const request = require("request");
const router = express.Router();

router.get("/", function(req, res) {
  request(
    "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=2dd412e3756049df0163f542e7863598",
    {
      json: true
    },
    function(err, requestRes, body) {
      console.log(body.results[0]);
      if (err) {
        res.send(err);
      } else {
        res.render("movies", {
          title: "Movies",
          moviesData: body.results
        });
      }
    }
  );
});

router.get("/genres", function(req, res) {
  request(
    "https://api.themoviedb.org/3/genre/movie/list?api_key=2dd412e3756049df0163f542e7863598",
    {
      json: true
    },
    function(err, requestRes, body) {
      if (err) {
        res.send(err);
      } else {
        res.render("filter", {
          title: "Genres",
          genresData: body.genres
        });
      }
    }
  );
});

router.get("/search", function(req, res) {
  request(
    `https://api.themoviedb.org/3/search/movie?query=${req.query.query}&api_key=2dd412e3756049df0163f542e7863598`,
    {
      json: true
    },
    function(err, requestRes, body) {
      if (err) {
        res.send(err);
      } else {
        res.render("results", {
          title: "Movies",
          query: req.query.query,
          moviesData: body.results
        });
      }
    }
  );
});

router.get("/genres/:name/:id", function(req, res) {
  request(
    `https://api.themoviedb.org/3/discover/movie?api_key=2dd412e3756049df0163f542e7863598&sort_by=popularity.desc&with_genres=${req.params.id}`,
    {
      json: true
    },
    function(err, requestRes, body) {
      if (err) {
        res.send(err);
      } else {
        res.render("filterResults", {
          title: `Genere ${req.params.id}`,
          moviesData: body.results,
          genreName: req.params.name
        });
      }
    }
  );
});

router.get("/:id", function(req, res) {
  request(
    `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=2dd412e3756049df0163f542e7863598`,
    {
      json: true
    },
    function(err, requestRes, body) {
      if (err) {
        res.send(err);
      } else {
        res.render("movie", {
          title: `Movie ${req.params.id}`,
          movie: body
        });
      }
    }
  );
});

module.exports = router;
