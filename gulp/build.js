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
const sassGlob = require("gulp-sass-glob-use-forward");
// Images
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const svgSprite = require("gulp-svg-sprite");
// HTML
const panini = require("panini");
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
    .pipe(sassGlob())
    .pipe(
      sass({ silenceDeprecations: ["legacy-js-api"] }).on(
        "error",
        sass.logError
      )
    )
    .pipe(dest(buildCssPath, { sourcemaps: "." }));
}

function minCss() {
  const plugins = [autoprefixer(), cssnano()];

  return src("./src/scss/main.scss", { sourcemaps: true })
    .pipe(sassGlob())
    .pipe(
      sass({ silenceDeprecations: ["legacy-js-api"] }).on(
        "error",
        sass.logError
      )
    )
    .pipe(postCss(plugins))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest(buildCssPath, { sourcemaps: "." }));
}

function html() {
  panini.refresh();
  return src("./src/html/pages/**/*.html")
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
    .pipe(babel())
    .pipe(webpackStream(require("../webpack.prod")))
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
      maxWidth: 24,
      maxHeight: 24,
    },
    spacing: {
      padding: 0,
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
