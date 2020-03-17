const express = require("express");
const moviesRouter = require("./routes/moviesRoute");

const config = {
    port: process.env.PORT || 3000
};

const app = express();

app.get("/", function (req, res) {
    // Send a plain string using res.send();
    res.redirect('/movies')
});

app
    .set("view engine", "ejs")
    .set("views", "views")

    .use(express.static("static"))
    .use("/movies", moviesRouter)

    .listen(config.port, function () {
        console.log(`Application started on port: ${config.port}`);
    });