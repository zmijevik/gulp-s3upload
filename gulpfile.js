var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpS3Upload = require('./index.js');
var gbug = require('gulp-debug');


gulp.task('js', function() {
	return gulp.src('./app/**/*', {buffer : false})
		// .pipe(gbug())
		.pipe(gulp.dest('./dist/'));
});


gulp.task('deploy', function() {
	var root = 'dist';
	return gulp.src('./dist/**/*', {buffer : false})
		.pipe(gulpS3Upload({root: root}));
});

gulp.task('deploy.staging', function() {
	var root = 'dist';
	return gulp.src('./dist/**/*', {buffer : false})
		.pipe(gulpS3Upload({root: root, bucketName: 'staging.advertising-client'}));
})
