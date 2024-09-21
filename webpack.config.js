module.exports = {
  mode: process.env.NODE_ENV || "production",
  entry: {
    index: "./src/js/index.js",
    contacts: "./src/js/contacts.js",
  },
  devtool: "inline-source-map",
  output: {
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
