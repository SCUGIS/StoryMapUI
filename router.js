// config
const config = require('./config.js')
const key = require('./key.json')

// module
const uuidv4 = require('uuid').v4
const express = require('express')
const { OAuth2Client } = require('google-auth-library')
const mongodb = require('mongodb').MongoClient
const assert = require('assert')

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

const resOK = data => {
  return {
    status: 'ok',
    res: data || null
  }
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
router.get(config.addr + '/api/map', auth((req, res) => {
  let client

  (async () => {
    try {
      client = await mongodb.connect(url, mongoConfig)
      const db = client.db(dbName)

      let result = await db.collection('map').find({
        owner: req.session.uid
      }).toArray()

      return result
    } catch (err) {
      throw err
    }
  })().then((result) => {
    client.close()
    res.json(resOK(result))
  }).catch(err => {
    console.log(err)
    res.json(resERR(err.message))
  })
}))

router.get(config.addr + '/api/map/:id', (req, res) => {
  let client

  (async () => {
    try {
      client = await mongodb.connect(url, mongoConfig)
      const db = client.db(dbName)

      let result = await db.collection('map').find({
        _id: req.params.id
      }).limit(1).toArray()

      let map = result[0].map

      if (!map) throw new Error('map notfound')

      if (Array.isArray(map)) {
        for (let i = 0; i < map.length; i++) {
          assert.strict.deepEqual(Object.keys(map[i]), [
            'id',
            'headline',
            'content',
            'loc',
            'media',
            'credit',
            'caption',
            'background',
            'marker',
            'color',
            'class'
          ], 'map not equal')
          console.log(map[i])
        }
      } else {
        throw new Error('not array')
      }

      let slides = []
      for (let i = 0; i < map.length; i++) {
        let s = map[i]
        console.log(s.loc)
        let slide = {
          date: '',
          location: {
            lat: s.loc[0],
            lon: s.loc[1],
            line: true,
            zoom: 14
          },
          text: {
            headline: s.headline,
            text: s.content
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
          zoomify: false,
          map_type: 'stamen:toner-lite',
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

router.post(config.addr + '/api/map', auth((req, res) => {
  let client

  (async () => {
    try {
      client = await mongodb.connect(url, mongoConfig)
      const db = client.db(dbName)
      const id = String(uuidv4())
      const map = JSON.parse(req.body.map)

      if (Array.isArray(map)) {
        for (let i = 0; i < map.length; i++) {
          assert.strict.deepEqual(Object.keys(map[i]), [
            'id',
            'headline',
            'content',
            'loc',
            'media',
            'credit',
            'caption',
            'background',
            'marker',
            'color',
            'class'
          ], 'map not equal')
          console.log(map[i])
        }
      } else {
        throw new Error('not array')
      }

      let result = await db.collection('map').insertOne({
        _id: id,
        owner: req.session.uid,
        name: req.body.name,
        map: map
      })

      if (result.insertedCount !== 1) throw new Error('insert failed')
      return id
    } catch (err) {
      throw err
    }
  })().then((result) => {
    client.close()
    res.json(resOK({
      id: result
    }))
  }).catch(err => {
    console.log(err)
    res.json(resERR(err.message))
  })
}))

router.patch(config.addr + '/api/map/:id', auth((req, res) => {
  let client
  (async () => {
    try {
      client = await mongodb.connect(url, mongoConfig)
      const db = client.db(dbName)
      const map = JSON.parse(req.body.map)

      if (Array.isArray(map)) {
        for (let i = 0; i < map.length; i++) {
          assert.strict.deepEqual(Object.keys(map[i]), ['image', 'credit', 'caption', 'headline', 'content'], 'map not equal')
          console.log(map[i])
        }
      } else {
        throw new Error('not array')
      }

      let result = await db.collection('map').updateOne({
        _id: req.params.id,
        owner: req.session.uid
      }, {
        $set: {
          name: req.body.name,
          map: map
        }
      })

      if (result.matchedCount !== 1) throw new Error('update failed')
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

      let result = await db.collection('map').deleteOne({
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
