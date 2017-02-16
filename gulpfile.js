var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('serve', ['sass', 'dist'], function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        open: false,
        online: false,
        notify: false
    });

    gulp.watch('scss/**', ['sass']);
    gulp.watch('js/jelly.js', ['dist']);
    gulp.watch(['*.html', 'js/**', 'dist/**']).on('change', browserSync.reload);
});

gulp.task('sass', function () {
    return gulp.src('scss/**')
        .pipe(sass({
            outputStyle: 'expanded',
            includePaths: ['scss']
        }))
        .pipe(prefix(['last 15 versions'], { cascade: true }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('dist', function(){
    return gulp.src('js/jelly.js')
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('js'));
});

gulp.task('default', ['serve']);
