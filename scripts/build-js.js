const gulp = require('gulp')
const concat = require('gulp-concat');

return gulp.src([
        './puplic/js/*.js',
    ])
    .pipe(concat('index.js'))
    .pipe(gulp.dest('./static/'))