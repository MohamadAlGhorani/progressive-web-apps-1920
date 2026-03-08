require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const moviesRouter = require("./routes/moviesRoute");

const config = {
  port: process.env.PORT || 3000
};

const app = express();

app.set("etag", "strong");
app.set("view engine", "ejs");
app.set("views", "views");

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "https://image.tmdb.org", "data:"],
      frameSrc: ["https://www.youtube-nocookie.com", "https://www.youtube.com"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
app.use(compression());

// No cache for service worker so browser always checks for updates
app.use("/service-worker.js", express.static("static/service-worker.js", { maxAge: 0 }));
app.use(express.static("static", { maxAge: "1d" }));

app.get("/", function(req, res) {
  res.redirect("/movies");
});

app.use("/movies", moviesRouter);

app.listen(config.port, function() {
  console.log(`Application started on port: ${config.port}`);
});
