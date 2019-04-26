// config
const config = require('./config.js')
const key = require('./key.json')

// module
const uuidv4 = require('uuid').v4
const express = require('express')
const { OAuth2Client } = require('google-auth-library')
const mongodb = require('mongodb').MongoClient
const assert = require('assert').strict

const router = module.exports = express.Router()
const client = new OAuth2Client(key.web.client_id)

const fs = require('fs')
const path = require('path')
const staticPage = (cb) => {
  let encode = 'UTF-8'

  fs.readFile(path.join(__dirname, 'public/storymap.html'), encode, (err, file) => {
    console.log(err)
    cb(file)
  })
}

// mongo
const url = 'mongodb://' + config.db.account + ':' + config.db.passwd + '@localhost:27017/' + config.db.name
const dbName = config.db.name
const mongoConfig = {
  useNewUrlParser: true
}

const resOK = (data = {}) => {
  data.status = 'ok'
  return data
}

const resERR = data => {
  return {
    status: 'err',
    msg: data || null
  }
}

const auth = cb => {
  return (req, res) => {
    if (req.session.uid) {
      cb(req, res)
    } else {
      console.log('nologin')
      res.json(resERR('nologin'))
    }
  }
}

const equalSlide = slide => {
  assert.strict.deepEqual(Object.keys(slide), [
    'id',
    'headline',
    'content',
    'loc',
    'zoom',
    'media',
    'credit',
    'caption',
    'background',
    'marker',
    'color'
  ], 'slide not equal')
}

// account api
router.post(config.addr + '/api/login', (req, res) => {
  (async () => {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: key.web.client_id
    })
    return ticket.getPayload()
  })().then(payload => {
    req.session.uid = payload.email
    res.json(resOK())
  }).catch(err => {
    console.log(err)
    res.json(resERR(err.message))
  })
})

router.get(config.addr + '/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect(config.addr)
  })
})

router.get(config.addr + '/link/:id', (req, res) => {
  staticPage(file => {
    res.send(file)
  })
})

// map api
// get
router.get(config.addr + '/api/map/:id', (req, res) => {
  let client

  (async () => {
    try {
      client = await mongodb.connect(url, mongoConfig)
      const db = client.db(dbName)

      console.log(req.params.id)
      let result = await db.collection('public').find({
        _id: req.params.id
      }).limit(1).toArray()
      console.log(result)

      let map = result[0]

      if (!map) throw new Error('map not found')
      let setStyle = (content, style) => {
        return `<div style='${style}'>
          ${content}
        </div>`
      }

      let slides = []
      for (let i = 0; i < map.slides.length; i++) {
        let s = map.slides[i]
        let slide = {
          date: '',
          location: {
            lat: s.loc[0],
            lon: s.loc[1],
            line: true,
            zoom: s.zoom
          },
          text: {
            headline: setStyle(s.headline, `font-family: "Helvetica", "Arial","LiHei Pro","黑體-繁","微軟正黑體", sans-serif; color: #000;`),
            text: setStyle(s.content, `font-family: "Helvetica", "Arial","LiHei Pro","黑體-繁","微軟正黑體", sans-serif; color: #111; font-size: 20px;`)
          },
          media: {
            url: s.media,
            caption: s.caption,
            credit: s.credit
          },
          background: {
            url: s.background,
            color: s.color,
            opacity: 100
          }
        }
        if (i === 0) {
          slide.overview = true
        }

        if (s.marker) {
          slide.location.use_custom_marker = true
          slide.location.icon = s.marker
          slide.location.iconSize = [48, 48]
        }

        slides.push(slide)
      }

      let smap = {
        storymap: {
          maxZoom: 18,
          attribution: '',
          language: 'zh-tw',
          call_to_action: true,
          zoomify: true,
          map_type: map.layer,
          call_to_action_text: '',
          map_as_image: false,
          map_subdomains: '',
          slides: slides
        }
      }

      return smap
    } catch (err) {
      throw err
    }
  })().then((result) => {
    client.close()
    res.json(result)
  }).catch(err => {
    console.log(err)
    res.json(resERR(err.message))
  })
})

// read
router.get(config.addr + '/api/read', auth((req, res) => {
  let client

  (async () => {
    try {
      client = await mongodb.connect(url, mongoConfig)
      const db = client.db(dbName)

      let maps = await db.collection('maps').find({
        owner: req.session.uid
      }).toArray()

      for (let i = 0; i < maps.length; i++) {
        delete maps[i]._id
      }

      return maps
    } catch (err) {
      throw err
    }
  })().then((result) => {
    client.close()
    res.json(result)
  }).catch(err => {
    console.log(err)
    res.json(resERR(err.message))
  })
}))

// publish
router.post(config.addr + '/api/publish', (req, res) => {
  let client

  (async () => {
    try {
      client = await mongodb.connect(url, mongoConfig)
      const db = client.db(dbName)

      let map = await db.collection('maps').find({
        id: req.body.id,
        owner: req.session.uid
      }).limit(1).toArray()

      if (map.length === 0) throw new Error('map not found')

      await db.collection('public').save({
        _id: map[0]._id,
        id: map[0].id,
        layer: map[0].layer,
        owner: req.session.uid,
        slides: map[0].slides
      })

      return map[0]._id
    } catch (err) {
      throw err
    }
  })().then((result) => {
    client.close()
    res.json({
      status: 'ok',
      id: result
    })
  }).catch(err => {
    console.log(err)
    res.json(resERR(err.message))
  })
})

// sync
router.patch(config.addr + '/api/sync', auth((req, res) => {
  let client

  (async () => {
    try {
      client = await mongodb.connect(url, mongoConfig)
      const db = client.db(dbName)
      const slides = JSON.parse(req.body.slides)

      if (req.body.id &&
          req.body.maptype &&
          req.body.layer &&
          typeof req.body.maptype === 'string' &&
          typeof req.body.layer === 'string' &&
          Array.isArray(slides)) {
        console.log(req.body)
        for (let i = 0; i < slides.length; i++) {
          equalSlide(slides[i])
        }
      } else {
        throw new Error('not map')
      }
      console.log(req.body)

      if (req.body.status === 'update') {
        let result = await db.collection('maps').updateOne({
          id: req.body.id,
          owner: req.session.uid
        }, {
          $set: {
            maptype: req.body.maptype,
            layer: req.body.layer,
            slides: slides
          }
        })

        if (result.matchedCount !== 1) {
          const id = String(uuidv4())

          await db.collection('maps').insertOne({
            _id: id,
            id: req.body.id,
            owner: req.session.uid,
            maptype: req.body.maptype,
            layer: req.body.layer,
            slides: slides
          })
        }
      } else if (req.body.status === 'delete') {
        await db.collection('maps').removeOne({
          id: req.body.id,
          owner: req.session.uid
        })
      }
    } catch (err) {
      throw err
    }
  })().then(() => {
    client.close()
    res.json(resOK())
  }).catch(err => {
    console.log(err)
    res.json(resERR(err.message))
  })
}))

router.delete(config.addr + '/api/map/:id', auth((req, res) => {
  let client
  (async () => {
    try {
      client = await mongodb.connect(url, mongoConfig)
      const db = client.db(dbName)

      let result = await db.collection('maps').deleteOne({
        _id: req.params.id,
        owner: req.session.uid
      })

      if (result.deletedCount !== 1) throw new Error('delete failed')
    } catch (err) {
      throw err
    }
  })().then(() => {
    client.close()
    res.json(resOK())
  }).catch(err => {
    console.log(err)
    res.json(resERR(err.message))
  })
}))
