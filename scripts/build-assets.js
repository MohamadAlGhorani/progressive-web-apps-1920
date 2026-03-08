const gulp = require('gulp')

return gulp.src([
        './src/images/**/*.*',
        './src/service-worker.js',
        './src/manifest.json',
    ], { encoding: false })
    .pipe(gulp.dest('./static/'))