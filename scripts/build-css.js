const gulp = require("gulp");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");

return gulp
  .src(["./src/css/*.css"])
  .pipe(concat("index.css"))
  .pipe(
    autoprefixer({
      cascade: false
    })
  )
  .pipe(cleanCSS())
  .pipe(gulp.dest("./static/"));
