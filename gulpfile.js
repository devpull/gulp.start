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
  buildCss,
  buildHtml,
  buildJs,
  buildImg,
  buildServe
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

exports.devClean = devClean;
exports.default = series(
  devSetEnv,
  devSvg,
  parallel(devFonts, devCss, devHtml, devJs, devImg),
  parallel(devServe, devWatcher)
);

exports.build = series(
  buildSetEnv,
  buildClean,
  parallel(buildCss, buildHtml, buildJs, buildImg),
  parallel(buildServe)
);

exports.docs = series(
  docsClean,
  docsSvg,
  parallel(docsCss, docsHtml, docsJs, docsImg),
  docsRevision,
  docsRevisionRewrite,
  parallel(docsServe)
);