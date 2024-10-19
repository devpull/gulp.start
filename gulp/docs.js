const { src, dest, watch, series } = require("gulp");
const { readFileSync } = require("fs");
const del = require("del");
const changedInPlace = require("gulp-changed-in-place");
const changed = require("gulp-changed");
const browserSync = require("browser-sync").create();
// SASS
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("autoprefixer");
const postCss = require("gulp-postcss");
const cssnano = require("cssnano");
const sassGlob = require("gulp-sass-glob-use-forward");
// HTML
const panini = require("panini");
// JS
const webpackStream = require("webpack-stream");
const babel = require("gulp-babel");
// Images
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const svgSprite = require("gulp-svg-sprite");
// Debug
const debug = require("gulp-debug");
const plumber = require("gulp-plumber");
// Revision
const rev = require("gulp-rev");
const revRewrite = require("gulp-rev-rewrite");
const revDelOrigin = require("gulp-rev-delete-original");
const revFormat = require("gulp-rev-format");
// Paths
const buildPath = "./docs/";
const buildCssPath = buildPath + "css/";
const buildJsPath = buildPath + "js/";
const buildImgPath = buildPath + "img/";

// --- Tasks

function clean(done) {
  del.sync([buildPath]);
  done();
}

function css() {
  const plugins = [autoprefixer(), cssnano()];

  return src("./src/scss/main.scss", { sourcemaps: true })
    .pipe(sassGlob())
    .pipe(sass().on("error", sass.logError))
    .pipe(postCss(plugins))
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
    .pipe(plumber())
    .pipe(babel())
    .pipe(webpackStream(require("./../webpack.config")))
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(dest(buildJsPath));
}

function img() {
  return src(["./src/img/**/*.{jpg,jpeg,png,gif}"], { encoding: false })
    .pipe(changed(buildImgPath))
    .pipe(webp({ quality: 75 }))
    .pipe(dest(buildImgPath))
    .pipe(src("./src/img/**/*", { encoding: false }))
    .pipe(changed(buildImgPath))
    .pipe(imagemin({ verbose: true }))
    .pipe(dest(buildImgPath));
}

function serve() {
  browserSync.init({
    server: {
      baseDir: buildPath,
    },
  });
}

function revisionHash() {
  return src(`${buildPath}**/*.{css,js}`)
    .pipe(src(`${buildPath}**/*.{jpg,jpeg,gif,png,webp,svg}`, { encoding: false }))
    .pipe(rev())
    .pipe(
      revFormat({
        prefix: ".",
      })
    )
    .pipe(revDelOrigin())
    .pipe(dest(buildPath))
    .pipe(rev.manifest())
    .pipe(dest(buildPath));
}

function revisionRewrite() {
  const manifest = readFileSync("docs/rev-manifest.json");

  return src([`${buildPath}**/*.html`, `${buildPath}**/*.css`])
    .pipe(revRewrite({ manifest }))
    .pipe(dest(buildPath));
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
    .pipe(plumber())
    .pipe(svgSprite(svgConfig))
    .on("error", (error) => {
      console.log(error);
    })
    .pipe(dest(buildPath + "img/svg/"));
}

// --- Exports

exports.docsClean = clean;
exports.docsCss = css;
exports.docsHtml = html;
exports.docsJs = js;
exports.docsImg = img;
exports.docsSvg = svg;
exports.docsServe = serve;
exports.docsRevision = revisionHash;
exports.docsRevisionRewrite = revisionRewrite;
