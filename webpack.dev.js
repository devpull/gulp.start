const { merge } = require("webpack-merge");
const confCommon = require("./webpack.common");

module.exports = merge(confCommon, {
  mode: "development",
  devtool: "source-map",
});
