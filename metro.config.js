const { getDefaultConfig } = require("expo/metro-config");

// Workaround para Node.js < 19.4.0
if (!require("os").availableParallelism) {
  require("os").availableParallelism = () => require("os").cpus().length;
}

const config = getDefaultConfig(__dirname);

module.exports = config;
