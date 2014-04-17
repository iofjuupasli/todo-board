(function () {
    'use strict';

    var gulp = require('gulp'),
        jstConcat = require('gulp-jst-concat'),
        preprocess = require('gulp-preprocess'),
        livereload = require('gulp-livereload'),
        connect = require('connect'),
        less = require('gulp-less'),
        spawn = require('child_process').spawn,
        assets = require('gulp-assets'),
        uglifyjs = require('gulp-uglifyjs'),
        csso = require('gulp-csso'),
        rename = require('gulp-rename'),
        clean = require('gulp-clean');

    gulp.task('clean', function () {
        gulp.src(['dev', 'prod', 'src/libs'])
            .pipe(clean());
    });

    gulp.task('bower', function (next) {
        var bower = spawn('bower', ['install'], {cwd: 'src'});
        bower.on('close', function () {
            next();
        });
    });

    gulp.task('dev-libs', ['bower'], function () {
        gulp.src('src/libs/**')
            .pipe(gulp.dest('dev/libs'));
    });

    gulp.task('less', ['dev-libs'], function () {
        gulp.src('src/styles/main.less')
            .pipe(less({
                sourceMap: true
            }))
            .pipe(gulp.dest('dev'));
    });

    gulp.task('jst', function () {
        gulp.src('src/templates/*.html')
            .pipe(jstConcat('jst.js', {
                renameKeys: ['^.*templates/(.*).html$', '$1']
            }))
            .pipe(gulp.dest('dev/js'));
    });

    gulp.task('dev-js', function () {
        gulp.src('src/js/**')
            .pipe(gulp.dest('dev/js'));
    });

    gulp.task('dev-index', function () {
        gulp.src('src/index.html')
            .pipe(preprocess({
                context: {
                    DEV: true
                }
            }))
            .pipe(gulp.dest('dev'));
    });

    gulp.task('dev', ['bower', 'dev-libs', 'less', 'jst', 'dev-js', 'dev-index']);

    gulp.task('build-js', ['dev'], function () {
        gulp.src('dev/index.html')
            .pipe(assets.js())
            .pipe(uglifyjs('bundle.min.js'))
            .pipe(gulp.dest('prod'));
    });

    gulp.task('build-css', ['dev'], function () {
        gulp.src('dev/main.css')
            .pipe(csso())
            .pipe(rename('bundle.min.css'))
            .pipe(gulp.dest('prod'));
    });

    gulp.task('prod-index', function () {
        gulp.src('src/index.html')
            .pipe(preprocess())
            .pipe(gulp.dest('prod'));
    });

    gulp.task('prod', ['dev', 'build-js', 'build-css', 'prod-index']);

    gulp.task('prod-server', ['prod'], function (next) {
        connect().use(connect.static('./prod/')).listen(8081, next);
    });

    gulp.task('server', ['dev'], function (next) {
        connect().use(connect.static('./dev/')).listen(8080, next);
    });

    gulp.task('watch', ['dev', 'server'], function () {
        gulp.watch('src/bower.json', ['dev']);
        gulp.watch('src/styles/main.less', ['less']);
        gulp.watch('src/templates/*.html', ['jst']);
        gulp.watch('src/js/**', ['dev-js']);
        gulp.watch('src/index.html', ['dev-index']);

        var server = livereload();
        gulp.watch('dev/**').on('change', function (file) {
            server.changed(file.path);
        });
    });

    gulp.task('default', ['watch']);
}());