const { src, dest } = require("gulp");
const fs = require("fs");
const del = require("del");

const fonter = require("gulp-fonter-2");
const ttf2woff2 = require("gulp-ttf2woff2");
const fontfaceGen = require("gulp-fontfacegen");

// --- Tasks

function fonts() {
  del.sync("./dev/font/*.*");

  return src("./src/font/*.{eot,otf,ttf}", { encoding: false })
    .pipe(
      fonter({
        formats: ["ttf", "woff"],
      })
    )
    .pipe(ttf2woff2())
    .pipe(dest("./src/font/"));
}

function genFontface() {
  del.sync("./src/scss/base/_fontsAutoGen.scss");

  return src("./src/font/*.{woff,woff2}").pipe(
    fontfaceGen({
      filepath: "./src/scss/base",
      filename: "_fontsAutoGen.scss",
    })
  );
}

// --- Exports

exports.fonts2src = fonts;
exports.fontsScss = genFontface;