const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
// const RedisStore = require('connect-redis')(session)

// config
const config = require('./config.js')

const app = express()

app.set('port', config.port)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  name: 'storymap-ui',
  resave: true,
  saveUninitialized: true,
  secret: '600ece03-bcf7-4ede-ad41-f008ad8e74f8'
  // store: new RedisStore({
  // host: config.redis.host,
  // port: config.redis.port,
  // db: 1
  // })
}))

// router
const router = require('./router.js')
app.use('/', router)

app.listen(app.get('port'), () => {
  console.log('storymap-ui api listening on port ' + app.get('port') + ', mode: ' + app.get('env'))
})
