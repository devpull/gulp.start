const { src, dest, watch } = require("gulp");
const del = require("del");
const browserSync = require("browser-sync").create();
const webpackStream = require("webpack-stream");
// SASS
const sass = require("gulp-sass")(require("sass"));
// HTML
const fileInclude = require("gulp-file-include");
// Paths
const buildPath = "./dev/";
const buildCssPath = buildPath + "css/";
const buildJsPath = buildPath + "js/";
const buildImgPath = buildPath + "img/";
const mainScss = "./src/scss/main.scss";

// --- Tasks

function setEnv(done) {
  process.env.NODE_ENV = "production";
  done();
}

function clean(done) {
  del.sync([buildPath]);
  done();
}

function css() {
  return src(mainScss, { sourcemaps: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(dest(buildCssPath, { sourcemaps: true }));
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
    .pipe(dest(buildPath));
}

function js() {
  return src("./src/js/*.js")
    .pipe(webpackStream(require("../webpack.config")))
    .pipe(dest(buildJsPath));
}

function img() {
  return src("./src/img/**/*", { encoding: false }).pipe(dest(buildImgPath));
}

function serve() {
  browserSync.init({
    server: {
      baseDir: buildPath,
    },
  });
}

// --- Exports

exports.buildSetEnv = setEnv;
exports.buildClean = clean;
exports.buildCss = css;
exports.buildHtml = html;
exports.buildJs = js;
exports.buildImg = img;
exports.buildServe = serve;
