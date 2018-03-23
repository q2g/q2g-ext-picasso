var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
  return gulp.src(['./src/**/*.less'], { base: './src/' })
    .pipe(less())
    .pipe(gulp.dest('./src/'));
});

gulp.task('copy-src', function () {
    return gulp.src(['./src/**/*.html',
    './src/**/*.css',
    './src/**/*.js'])
    .pipe(gulp.dest('./dist/src'))
})

gulp.task('copy-node-davinci', function () {
    return gulp.src(['./node_modules/davinci.js/**/*'])
    .pipe(gulp.dest('./dist/node_modules/davinci.js'))
})

gulp.task('copy-node-picasso', function () {
    return gulp.src(['./node_modules/picasso.js/**/*'])
    .pipe(gulp.dest('./dist/node_modules/picasso.js'))
})

gulp.task('copy-node-q', function () {
    return gulp.src(['./node_modules/picasso-plugin-q/**/*'])
    .pipe(gulp.dest('./dist/node_modules/picasso-plugin-q'))
})

gulp.task('copy-node-ace', function () {
    return gulp.src(['./node_modules/ace-builds/src/**/*'])
    .pipe(gulp.dest('./dist/node_modules/ace-builds/src'))
})

gulp.task('copy-main', function () {
    return gulp.src(['./q2g-ext-picassoWizard.js',
    './q2g-ext-picassoWizard.qext',
    './LICENSE'])
    .pipe(gulp.dest('./dist'))
})