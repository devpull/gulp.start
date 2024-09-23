const { src, dest, watch } = require("gulp");
const del = require("del");
const browserSync = require("browser-sync").create();
const rename = require("gulp-rename");
// JS
const webpackStream = require("webpack-stream");
const babel = require("gulp-babel");
// SASS
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("autoprefixer");
const postCss = require("gulp-postcss");
const cssnano = require("cssnano");
// Images
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const svgSprite = require("gulp-svg-sprite");
// HTML
const fileInclude = require("gulp-file-include");
// Paths
const buildPath = "./dist/";
const buildCssPath = buildPath + "css/";
const buildJsPath = buildPath + "js/";
const buildImgPath = buildPath + "img/";
const buildFontsPath = buildPath + "font/";

// --- Tasks

function setEnv(done) {
  process.env.NODE_ENV = "production";
  done();
}

function clean(done) {
  del.sync(buildPath);
  done();
}

function fonts() {
  return src("./src/font/*.{woff,woff2}", { encoding: false }).pipe(
    dest(buildFontsPath)
  );
}

function css() {
  return src("./src/scss/main.scss", { sourcemaps: true })
    .pipe(
      sass({ silenceDeprecations: ["legacy-js-api"] }).on(
        "error",
        sass.logError
      )
    )
    .pipe(dest(buildCssPath, { sourcemaps: true }));
}

function minCss() {
  const plugins = [autoprefixer(), cssnano()];

  return src("./src/scss/main.scss", { sourcemaps: true })
    .pipe(
      sass({ silenceDeprecations: ["legacy-js-api"] }).on(
        "error",
        sass.logError
      )
    )
    .pipe(postCss(plugins))
    .pipe(rename({ extname: ".min.css" }))
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
    .pipe(babel())
    .pipe(webpackStream(require("../webpack.config")))
    .pipe(dest(buildJsPath));
}

function img() {
  return src("./src/img/**/*", { encoding: false })
    .pipe(webp({ quality: 75 }))
    .pipe(dest(buildImgPath))
    .pipe(src("./src/img/**/*", { encoding: false }))
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
      example: false,
    },
  },
};

function svg() {
  return src("./src/img/svg/**/*.svg")
    .pipe(svgSprite(svgConfig))
    .on("error", (error) => {
      console.log(error);
    })
    .pipe(dest(buildPath + "img/svg/"));
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
exports.buildFonts = fonts;
exports.buildCss = css;
exports.buildMinCss = minCss;
exports.buildHtml = html;
exports.buildJs = js;
exports.buildImg = img;
exports.buildSvg = svg;
exports.buildServe = serve;
