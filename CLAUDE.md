# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Progressive Web App for browsing movies (which-movies). Server-side rendered Express app using The Movie Database (TMDB) API. Features offline support via Service Worker, genre filtering, search, and movie detail pages with trailers.

## Commands

- `npm run dev` — Start dev server with nodemon (auto-rebuilds assets first, runs on localhost:3000)
- `npm start` — Production start (rebuilds assets first)
- `npm run build` — Clean `static/` dir and rebuild all assets (CSS, JS, images, service worker, manifest)
- `npm run build:css` — Concat and minify CSS from `src/css/` to `static/index.css`
- `npm run build:js` — Concat JS from `src/js/` to `static/index.js`
- `npm run build:assets` — Copy images, service worker, and manifest to `static/`
- `npm run watch` — Watch src files and rebuild on change (chokidar)
- No test suite configured

## Architecture

**Server:** Express app in `server.js`. Root `/` redirects to `/movies`. Uses EJS templates, gzip compression, and strong etags.

**Routing:** Single route file `routes/moviesRoute.js` handles all `/movies` endpoints:
- `GET /movies` — Homepage: fetches popular, top rated, upcoming, and now playing movies in parallel
- `GET /movies/:id` — Movie detail with trailers (fetches details + videos)
- `GET /movies/search?query=` — Search results
- `GET /movies/genres` — Genre list
- `GET /movies/genres/:name/:id` — Movies filtered by genre
- `GET /movies/offline` — Offline fallback page

**Build pipeline:** Gulp-based scripts in `scripts/` (not a gulpfile, each is a standalone Node script):
- `build-css.js` — gulp-concat + gulp-clean-css + autoprefixer → `static/index.css`
- `build-js.js` — gulp-concat → `static/index.js`
- `build-assets.js` — copies `src/images/`, `src/service-worker.js`, `src/manifest.json` → `static/`
- `prebuild` runs `rimraf ./static` to clean output before building

**Source vs Output:** Edit files in `src/` (CSS, JS, images, service worker, manifest). The `static/` directory is the build output served by Express and should not be edited directly.

**Views:** EJS templates in `views/` with partials in `views/partials/` (head.ejs, footer.ejs).

**Service Worker** (`src/service-worker.js`): Cache-first for core assets, stale-while-revalidate for HTML, offline fallback page.

## Environment

Requires a `.env` file with `movieDbKey` set to a TMDB API key. Deployed to Heroku (see `Procfile`).
