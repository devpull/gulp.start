module.exports = {
  entry: {
    index: "./src/js/index.js",
    // contacts: "./src/js/contacts.js",
  },
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
