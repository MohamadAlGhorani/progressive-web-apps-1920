const express = require("express");

const config = {
    port: 3000
};

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));

var moviesRouter = require("./routes/moviesRoute");
app.use("/movies", moviesRouter);

app.listen(config.port, function () {
    console.log(`Application started on port: ${config.port}`);
});