const { src, dest, watch, parallel } = require("gulp");
const del = require("del");
const changedInPlace = require("gulp-changed-in-place");
const changed = require("gulp-changed");
const browserSync = require("browser-sync").create();
const webpackStream = require("webpack-stream");
// SASS
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("autoprefixer");
const postCss = require("gulp-postcss");
const sassGlob = require("gulp-sass-glob");
// HTML
const panini = require("panini");
// Images
const svgSprite = require("gulp-svg-sprite");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
// Debug
const debug = require("gulp-debug");
const plumber = require("gulp-plumber");
// Paths
const buildPath = "./dev/";
const buildCssPath = buildPath + "css/";
const buildJsPath = buildPath + "js/";
const buildImgPath = buildPath + "img/";
const buildFontsPath = buildPath + "font/";

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
  return src("./src/font/*.{woff,woff2}", { encoding: false })
    .pipe(changed(buildFontsPath))
    .pipe(dest(buildFontsPath));
}

function css() {
  const plugins = [autoprefixer()];

  return src("./src/scss/main.scss", { sourcemaps: true })
    .pipe(sassGlob())
    .pipe(
      sass({ silenceDeprecations: ["legacy-js-api"] }).on(
        "error",
        sass.logError
      )
    )
    .pipe(postCss(plugins))
    .pipe(dest(buildCssPath, { sourcemaps: true }))
    .pipe(browserSync.stream());
}

function html() {
  panini.refresh();
  return src("./src/html/pages/**/*.html")
    .pipe(plumber())
    .pipe(
      panini({
        root: "./src/html/pages/",
        layouts: "./src/html/layouts/",
        partials: "./src/html/partials/",
        helpers: "./src/html/helpers/",
        data: "./src/html/data/",
      })
    )
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
  watch(["./src/html/**/*.{html,json}"], html).on("change", browserSync.reload);
  watch("./src/scss/**/*.scss", css);
  watch("./src/js/**/*.js", js);
  watch(["./src/img/**/*", "!./src/img/svg/*"], img).on(
    "change",
    browserSync.reload
  );
  watch("./src/font/*.{woff,woff2}", fonts).on("change", browserSync.reload);
  watch("./src/img/svg/**/*.svg", parallel(svg, img)).on(
    "change",
    browserSync.reload
  );
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
