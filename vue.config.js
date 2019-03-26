const config = require('./config.js')
const GOOGLE_MAP_KEY = config.key.googleMap
const BASE_URL = config.addr
console.log('GOOGLE_MAP_KEY:' + GOOGLE_MAP_KEY)
console.log('BASE_URL:' + BASE_URL)

module.exports = {
  publicPath: BASE_URL,
  configureWebpack: cfg => {
    cfg.externals = {
      'gapi': 'gapi',
      'VCO': 'VCO',
      'L': 'L',
      'L1': 'L1',
      'stamen': 'stamen'
    }
  },
  chainWebpack: cfg => {
    cfg.plugin('html').tap(args => {
      args[0].templateParameters = {
        GOOGLE_MAP_KEY,
        BASE_URL
      }
      return args
    })
  }
}
