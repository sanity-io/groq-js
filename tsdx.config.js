const commonjs = require('@rollup/plugin-commonjs')

module.exports = {
  rollup(config, options) {
    config.plugins.push(commonjs())
    return config
  }
}
