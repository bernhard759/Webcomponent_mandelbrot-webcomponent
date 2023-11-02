const webpack = require('webpack');
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "mandelbrot-widget.js",
    path: path.resolve(__dirname, "./public/dist"),
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
