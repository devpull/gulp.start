const { series, parallel } = require("gulp");

const {
  devSetEnv,
  devClean,
  devFonts,
  devCss,
  devHtml,
  devJs,
  devImg,
  devSvg,
  devServe,
  devWatcher,
} = require("./gulp/dev");

const {
  buildSetEnv,
  buildClean,
  buildFonts,
  buildCss,
  buildHtml,
  buildJs,
  buildImg,
  buildServe,
  buildSvg,
  buildMinCss,
} = require("./gulp/build");

const {
  docsClean,
  docsCss,
  docsHtml,
  docsJs,
  docsImg,
  docsServe,
  docsRevision,
  docsRevisionRewrite,
  docsSvg,
} = require("./gulp/docs");

const { fonts2src, fontsScss } = require("./gulp/fonts");

// Dev
exports.devClean = devClean;
exports.default = series(
  devSetEnv,
  devSvg,
  parallel(devFonts, devCss, devHtml, devJs, devImg),
  parallel(devServe, devWatcher)
);

// Build
exports.build = series(
  buildSetEnv,
  buildClean,
  buildSvg,
  parallel(buildFonts, buildCss, buildMinCss, buildHtml, buildJs, buildImg),
  parallel(buildServe)
);

// Docs
exports.docs = series(
  docsClean,
  docsSvg,
  parallel(docsCss, docsHtml, docsJs, docsImg),
  docsRevision,
  docsRevisionRewrite,
  parallel(docsServe)
);

// Fonts
exports.fonts = series(fonts2src, fontsScss);
exports.fonts2src = fonts2src;
exports.fontsScss = fontsScss;