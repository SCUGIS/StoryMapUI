module.exports = {
  baseUrl: '/storymap/',
  configureWebpack: config => {
    config.externals = {
      'gapi': 'gapi',
      'VCO': 'VCO',
      'L': 'L',
      'L1': 'L1',
      'stamen': 'stamen'
    }
  }
}
