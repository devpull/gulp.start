const { src, dest, watch } = require("gulp");
const del = require("del");
const changedInPlace = require("gulp-changed-in-place");
const changed = require("gulp-changed");
const browserSync = require("browser-sync").create();
const webpackStream = require("webpack-stream");
// SASS
const sass = require("gulp-sass")(require("sass"));
// HTML
const fileInclude = require("gulp-file-include");
// Images
const svgSprite = require("gulp-svg-sprite");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
// Fonts
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");
// Debug
const debug = require("gulp-debug");
const plumber = require("gulp-plumber");
// Paths
const buildPath = "./dev/";
const buildCssPath = buildPath + "css/";
const buildJsPath = buildPath + "js/";
const buildImgPath = buildPath + "img/";
const buildFontsPath = buildPath + "fonts/";
const mainScss = "./src/scss/main.scss";

// --- Tasks

function setEnv(done) {
  process.env.NODE_ENV = "development";
  done();
}

function clean(done) {
  del.sync(buildPath);
  done();
}

function fonts() {
  return src("./src/fonts/*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(ttf2woff2())
    .pipe(dest(buildFontsPath));
}

function css() {
  return src(mainScss, { sourcemaps: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(dest(buildCssPath, { sourcemaps: true }))
    .pipe(browserSync.stream());
}

function html() {
  return src([
    "./src/html/**/*.html",
    "!./src/html/partials/*.html",
    "!./src/html/partials/templates/*.html",
  ])
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(dest(buildPath));
}

function js() {
  return src("./src/js/*.js")
    .pipe(plumber())
    .pipe(webpackStream(require("./../webpack.config")))
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(dest(buildJsPath))
    .pipe(browserSync.stream());
}

function img() {
  return src("./src/img/**/*.{jpg,jpeg,png,gif}", { encoding: false })
    .pipe(changed(buildImgPath))
    .pipe(webp({ quality: 75 }))
    .pipe(dest(buildImgPath))
    .pipe(src("./src/img/**/*", { encoding: false }))
    .pipe(changed(buildImgPath))
    .pipe(imagemin({ verbose: true }))
    .pipe(dest(buildImgPath));
}

const svgConfig = {
  shape: {
    dimension: {
      maxWidth: 32,
      maxHeight: 32,
    },
    spacing: {
      padding: 5,
    },
    transform: [
      {
        svgo: {
          plugins: [
            {
              name: "removeAttrs",
              params: {
                attrs: "(fill|stroke)",
              },
            },
          ],
        },
      },
    ],
    // dest: "./shaped/",
  },
  mode: {
    symbol: {
      sprite: "../symbol.sprite.svg",
      example: true,
    },
    stack: {
      example: true,
    },
  },
};

function svg() {
  return src("./src/img/svg/**/*.svg")
    .pipe(plumber())
    .pipe(svgSprite(svgConfig))
    .on("error", (error) => {
      console.log(error);
    })
    .pipe(dest(buildPath + "img/svg/"));
}

function watcher() {
  watch(["./src/html/**/*.html", "./src/html/**/*.json"], html).on(
    "change",
    browserSync.reload
  );
  watch(["./src/scss/**/*.scss"], css);
  watch(["./src/js/**/*.js"], js);
  watch(["./src/img/**/*"], img).on("change", browserSync.reload);
}

function serve() {
  browserSync.init({
    server: {
      baseDir: buildPath,
    },
  });
}

// --- Exports

exports.devSetEnv = setEnv;
exports.devClean = clean;
exports.devFonts = fonts;
exports.devCss = css;
exports.devHtml = html;
exports.devJs = js;
exports.devImg = img;
exports.devSvg = svg;
exports.devWatcher = watcher;
exports.devServe = serve;
