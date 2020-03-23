const express = require("express");
const compression = require("compression");
const moviesRouter = require("./routes/moviesRoute");

const config = {
  port: process.env.PORT || 3000
};

const app = express();

app.get("/", function(req, res) {
  // Send a plain string using res.send();
  res.redirect("/movies");
});

app
  .enable("etag") // use strong etags
  .set("etag", "strong") // same
  .set("view engine", "ejs")
  .set("views", "views")

  .use(compression())
  .use((req, res, next) => {
    res.header("Cache-Control", "max-age=2592000000");
    next();
  })
  .use(express.static("static"))
  .use("/movies", moviesRouter)

  .listen(config.port, function() {
    console.log(`Application started on port: ${config.port}`);
  });
