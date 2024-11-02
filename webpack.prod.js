const TerserPlugin = require("terser-webpack-plugin");
const { merge } = require("webpack-merge");
const confCommon = require("./webpack.common");

module.exports = merge(confCommon, {
  mode: "production",
  devtool: "source-map",
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          }
        }
      }),
    ],
    minimize: true,
  },
});
