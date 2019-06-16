const path = require('path');

module.exports = {
    entry: "./index.js",
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: "bundle.js",
        publicPath: "/myPassport/"
    },
    devtool: 'eval-source-map',
};