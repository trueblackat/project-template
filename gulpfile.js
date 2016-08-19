'use strict';
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    pug = require('gulp-pug'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    spritesmith = require("gulp.spritesmith"),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    inject = require('gulp-inject'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    notify = require("gulp-notify"),
    rigger = require("gulp-rigger"),
    browserSync = require('browser-sync').create();

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/images/',
        fonts: 'build/fonts/'
    },
    src: {
        pug: 'src/*.pug',
        mainJs: 'src/js/main.js',
        vendorsJs: 'src/js/vendors.js',
        style: 'src/sass/main.sass',
        img: 'src/images/**/*.*',
        pngSprite: 'src/sprite/png/',
        svgSprite: 'src/sprite/svg/**/*.svg',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        pug: 'src/**/*.pug',
        mainJs: 'src/js/**/main.js',
        vendorsJs: 'src/js/**/vendors.js',
        style: 'src/sass/**/*.*',
        img: 'src/images/**/*.*',
        pngSprite: 'src/sprite/png/*.png',
        svgSprite: 'src/sprite/svg/**/*.svg',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
});

gulp.task('html:build', function () {
    gulp.src(path.src.pug)
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());
});

gulp.task('mainJs:build', function () {
    gulp.src(path.src.mainJs)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
});

gulp.task('vendorsJs:build', function () {
    gulp.src(path.src.vendorsJs)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        //.pipe(sourcemaps.init())
        .pipe(sass({errLogToConsole: true}))
        .pipe(prefixer())
        .pipe(cssmin())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.stream());
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.stream());
});

gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

// PNG Sprites
gulp.task('png-sprite', function () {
    var spriteData =
        gulp.src(path.src.pngSprite + '*.*')
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: '_png-sprite.sass',
                cssFormat: 'sass',
                algorithm: 'binary-tree',
                cssTemplate: 'sass.template.mustache',
                cssVarMap: function (sprite) {
                    sprite.name = sprite.name
                }
            }));

    spriteData.img.pipe(gulp.dest('src/images/'));
    spriteData.css.pipe(gulp.dest('src/sass/'));
});

// SVG Sprites
gulp.task('svg-sprite', function () {

    var svgs = gulp
        .src(path.src.svgSprite)
        .pipe(rename({prefix: 'svg-icon-'}))
        .pipe(svgmin())
        .pipe(svgstore({ inlineSvg: true }));

    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src('src/pug/svg.pug')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest('src/pug'));

});

gulp.task('build', [
    'html:build',
    'mainJs:build',
    'vendorsJs:build',
    'style:build',
    'fonts:build',
    'image:build',
    'png-sprite',
    'svg-sprite'
]);

gulp.task('watch', function () {
    watch([path.watch.pug], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.mainJs], function (event, cb) {
        gulp.start('mainJs:build');
    });
    watch([path.watch.vendorsJs], function (event, cb) {
        gulp.start('vendorsJs:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.pngSprite], function (event, cb) {
        gulp.start('png-sprite');
    });
    watch([path.watch.svgSprite], function (event, cb) {
        gulp.start('svg-sprite');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('default', ['build', 'browser-sync', 'watch']);
