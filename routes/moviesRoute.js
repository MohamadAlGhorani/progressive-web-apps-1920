const express = require("express");
const router = express.Router();

const apiUrl = "https://api.themoviedb.org/3/";
const apiKey = () => process.env.movieDbKey;

function tmdb(path) {
  const separator = path.includes("?") ? "&" : "?";
  return fetch(`${apiUrl}${path}${separator}api_key=${apiKey()}&language=en-US`)
    .then(r => r.json());
}

router.get("/", function (req, res) {
  Promise.all([
    tmdb("trending/movie/week"),
    tmdb("movie/popular?page=1"),
    tmdb("movie/top_rated?page=1"),
    tmdb("movie/upcoming?page=1"),
    tmdb("movie/now_playing?page=1"),
    tmdb("genre/movie/list")
  ]).then(([trending, popular, topRated, upcoming, nowPlaying, genreList]) => {
    const genres = {};
    (genreList.genres || []).forEach(g => { genres[g.id] = g.name; });

    const hero = (trending.results || []).slice(0, 5).map(m => ({
      ...m,
      genreNames: (m.genre_ids || []).map(id => genres[id]).filter(Boolean)
    }));

    res.render("movies", {
      title: "Which Movies",
      metaDescription: "Discover trending, popular, and top-rated movies. Browse trailers, ratings, and more.",
      hero,
      moviesData: {
        trending: trending.results || [],
        popular: popular.results || [],
        topRated: topRated.results || [],
        upcoming: upcoming.results || [],
        nowPlaying: nowPlaying.results || []
      }
    });
  }).catch(() => {
    res.status(500).render("offline", { title: "Error" });
  });
});

router.get("/offline", function (req, res) {
  res.render("offline", { title: "Offline" });
});

router.get("/genres", function (req, res) {
  Promise.all([
    tmdb("genre/movie/list"),
    tmdb("trending/movie/week")
  ]).then(([genresData, trending]) => {
    var allMovies = trending.results || [];
    var genres = (genresData.genres || []).map(function (g) {
      var movies = allMovies.filter(function (m) {
        return m.genre_ids && m.genre_ids.includes(g.id) && m.backdrop_path;
      }).slice(0, 4);
      return {
        id: g.id,
        name: g.name,
        backdrop: movies.length ? movies[0].backdrop_path : null,
        movies: movies
      };
    });
    res.render("filter", {
      title: "Genres",
      metaDescription: "Browse movies by genre. Discover action, comedy, drama, horror, sci-fi, and more.",
      genres: genres
    });
  }).catch(() => {
    res.status(500).render("offline", { title: "Error" });
  });
});

router.get("/search", function (req, res) {
  const query = req.query.query || "";
  tmdb(`search/movie?query=${encodeURIComponent(query)}&page=1`)
    .then(moviesData => {
      const all = moviesData.results || [];
      var topPick = null;
      var rest = all;
      if (all.length > 1) {
        var withBackdrop = all.filter(m => m.backdrop_path && m.vote_average > 0);
        if (withBackdrop.length) {
          withBackdrop.sort((a, b) => (b.vote_average * Math.log(b.vote_count + 1)) - (a.vote_average * Math.log(a.vote_count + 1)));
          topPick = withBackdrop[0];
          rest = all.filter(m => m.id !== topPick.id);
        }
      }
      res.render("results", {
        title: `Search: ${query}`,
        metaDescription: topPick ? `Best match: ${topPick.title}. ${moviesData.total_results || all.length} results found.` : `Search results for "${query}".`,
        ogImage: topPick && topPick.backdrop_path ? `https://image.tmdb.org/t/p/w1280${topPick.backdrop_path}` : undefined,
        query,
        topPick,
        moviesData: rest,
        totalResults: moviesData.total_results || all.length
      });
    }).catch(() => {
      res.status(500).render("offline", { title: "Error" });
    });
});

router.get("/genres/:name/:id", function (req, res) {
  var genreId = encodeURIComponent(req.params.id);
  Promise.all([
    tmdb(`discover/movie?sort_by=popularity.desc&with_genres=${genreId}&page=1`),
    tmdb(`discover/movie?sort_by=vote_average.desc&vote_count.gte=200&with_genres=${genreId}&page=1`)
  ]).then(([popular, topRated]) => {
    var allPopular = popular.results || [];
    var featured = (topRated.results || []).slice(0, 5);
    var featuredIds = featured.map(m => m.id);
    var rest = allPopular.filter(m => !featuredIds.includes(m.id));

    res.render("filterResults", {
      title: req.params.name,
      metaDescription: `Top ${req.params.name} movies — browse popular and critically acclaimed picks.`,
      featured,
      moviesData: rest,
      genreName: req.params.name
    });
  }).catch(() => {
    res.status(500).render("offline", { title: "Error" });
  });
});

// API endpoint for trailer preview (used by client-side JS)
router.get("/api/trailer/:id", function (req, res) {
  var id = encodeURIComponent(req.params.id);
  tmdb(`movie/${id}/videos`).then(function (data) {
    var trailer = (data.results || []).find(v => v.type === "Trailer" && v.site === "YouTube")
      || (data.results || []).find(v => v.site === "YouTube")
      || null;
    res.json({ key: trailer ? trailer.key : null });
  }).catch(function () {
    res.json({ key: null });
  });
});

// API endpoint for search autocomplete
router.get("/api/search", function (req, res) {
  var query = req.query.q || "";
  if (!query.trim()) return res.json([]);
  tmdb(`search/movie?query=${encodeURIComponent(query)}&page=1`).then(function (data) {
    var results = (data.results || []).slice(0, 8).map(function (m) {
      return {
        id: m.id,
        title: m.title,
        year: m.release_date ? m.release_date.substring(0, 4) : "",
        rating: m.vote_average ? m.vote_average.toFixed(1) : null,
        poster: m.poster_path
      };
    });
    res.json(results);
  }).catch(function () {
    res.json([]);
  });
});

router.get("/:id", function (req, res) {
  const id = encodeURIComponent(req.params.id);
  Promise.all([
    tmdb(`movie/${id}`),
    tmdb(`movie/${id}/videos`),
    tmdb(`movie/${id}/credits`),
    tmdb(`movie/${id}/similar?page=1`),
    tmdb("genre/movie/list")
  ]).then(([details, videos, credits, similar, genreList]) => {
    const genres = {};
    (genreList.genres || []).forEach(g => { genres[g.id] = g.name; });

    const trailer = (videos.results || []).find(v => v.type === "Trailer" && v.site === "YouTube")
      || (videos.results || []).find(v => v.site === "YouTube")
      || null;

    res.render("movie", {
      title: details.title || "Movie",
      metaDescription: details.overview || "",
      ogImage: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : undefined,
      origin: `${req.protocol}://${req.get("host")}`,
      movie: {
        ...details,
        genreNames: (details.genres || []).map(g => g.name),
        trailer,
        cast: (credits.cast || []).slice(0, 12),
        similar: (similar.results || []).slice(0, 12)
      }
    });
  }).catch(() => {
    res.status(500).render("offline", { title: "Error" });
  });
});

module.exports = router;
