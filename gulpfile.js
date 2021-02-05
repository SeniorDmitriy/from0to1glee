const { src, dest, watch, parallel, series } = require('gulp');
const scss          = require('gulp-sass');
const concat        = require('gulp-concat');
const autoprefixer  = require('gulp-autoprefixer');
const uglify        = require('gulp-uglify');
const imagemin      = require('gulp-imagemin');
const del           = require('del');
const webp          = require('gulp-webp');
const webphtml      = require('gulp-webp-html');
const webpcss       = require('gulp-webp-css');
const browserSync   = require('browser-sync').create();


function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/"
    },
    notify: false
  })
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true
    }))
    .pipe(webpcss())
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/slick-carousel/slick/slick.js',                                                                                                                                                                                                                                                                                               
      'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function html() {
  return src('app/**/*.html')
  .pipe(webphtml())
  .pipe(dest('dist'))
}

function images(){
  return src('app/images/**/*.*')
  .pipe(webp({
    quality: 70
  }))
  .pipe(dest('dist/images'))
  .pipe(src('app/images/**/*.*'))
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 70, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
  ]))
  .pipe(dest('dist/images'))
}

function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/fonts/*.*',
    'app/js/main.min.js'
  ], {base: 'app'})
  .pipe(dest('dist'))
}

function cleanDist() {
  return del('dist')
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.html = html;
exports.cleanDist = cleanDist;

exports.default = series(cleanDist, images, build, parallel(styles, scripts, html, browsersync, watching));