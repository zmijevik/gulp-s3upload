var gulp = require('gulp');
var gutil = require('gulp-util');
var app = require('./deploys3');
var gbug = require('gulp-debug');
gulp.task('js', function() {
	return gulp.src('./app/**/*', {buffer : false})
		.pipe(gbug())
		.pipe(gulp.dest('./dist/'));
});


gulp.task('deploy', function() {
	return gulp.src('./dist/**/*', {buffer : false})
		.pipe(gbug())
		.pipe(app())
});
