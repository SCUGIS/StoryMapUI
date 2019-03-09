const config = module.exports = {}

config.port = 3003
config.addr = '/storymap'

config.db = {
  name: 'storymap',
  account: 'storymap',
  passwd: 'storymap'
}

config.redis = {
  host: '127.0.0.1',
  port: 6379
}
