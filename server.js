const express = require("express");
const moviesRouter = require("./routes/moviesRoute");

const config = {
    port: 3000
};

const app = express();

app
    .set("view engine", "ejs")
    .set("views", "views")

    .use(express.static('static'))
    .use("/movies", moviesRouter)


    .listen(config.port, function () {
        console.log(`Application started on port: ${config.port}`);
    });