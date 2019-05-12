<template>
  <v-app>
    <v-toolbar app class="toolbar">
      <v-toolbar-title class="headline text-uppercase">
        <span>storymap</span>
        <span class="font-weight-light">UI</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        color="success"
        @click="publish"
        v-show="loginStatus"
        dark
      >
        Publish
      </v-btn>
      <v-btn
        color="info"
        @click="setPreview"
        v-html="perviewBtn"
        dark
      >
      </v-btn>
      <v-menu
        v-if="loginStatus"
        offset-y
      >
        <v-btn
          slot="activator"
          color="primary"
          v-html="username"
          dark
        >
        </v-btn>
        <v-list>
          <v-list-tile
            @click="listUI = true"
          >
            <v-list-tile-title>Manage</v-list-tile-title>
          </v-list-tile>
          <a id="downloadJSON" style="display:none"></a>
          <v-list-tile
            @click="backup"
          >
            <v-list-tile-title>Backup</v-list-tile-title>
          </v-list-tile>
          <input type="file" id="uploadBackup" multiple="true" accept=".json" style="display:none" @change="processJSON($event)">
          <v-list-tile
            @click="restore"
          >
            <v-list-tile-title>Restore</v-list-tile-title>
          </v-list-tile>
          <v-list-tile
            @click="loginUI = true"
          >
            <v-list-tile-title>Logout</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-btn
        v-else
        color="success"
        dark
        @click="loginUI = true"
      >
        Login
      </v-btn>
    </v-toolbar>

    <v-content>
      <v-container v-if="previewUI" pa-0 fluid fill-height>
        <div id="storymap" class="storymap"></div>
      </v-container>
      <v-container v-else pa-0 fluid fill-height>
        <v-layout row fill-height>
          <v-navigation-drawer permanent width="250" class="slideList">
            <v-list two-line>
              <v-list-tile
                v-for="(slide, index) in maps[selected.map].slides"
                :key="slide.id"
                avatar
                @click="selectSlide(index)"
                :class="selected.slide === index ? 'slide selected' : 'slide'"
              >
                <v-list-tile-avatar>
                  <v-img
                    :src="slide.media"
                    aspect-ratio="2"
                    class="imgbg"
                  ></v-img>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title>{{ slide.headline === '' ? '(untitled)' : slide.headline }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ slide.content }}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action
                  v-if="index !== 0"
                  @click="selectDel(index, 'Slide')"
                >
                  <v-btn icon ripple>
                    <v-icon color="error lighten-1">clear</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
              <v-list-tile
                @click="addSlide"
                class="slide"
              >
                <v-list-tile-content>
                  <v-list-tile-title>Add Slide</v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon color="success lighten-1">add_box</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-navigation-drawer>
          <v-layout column>
            <v-flex d-flex xs12>
              <div id="map" class="map"></div>
            </v-flex>
            <v-layout d-layout row class="console">
              <v-flex d-flex xs3>
                <v-card tile flat>
                  <v-card-text>
                    <span class="title font-weight-bold text-bold">
                      MEDIA
                    </span>
                    <v-card>
                      <v-img
                        :src="maps[selected.map].slides[selected.slide].media"
                        aspect-ratio="2"
                        class="imgbg"
                      ></v-img>
                    </v-card>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex d-flex xs3>
                <v-card tile flat>
                  <v-card-text>
                    <v-form>
                      <v-text-field
                        v-model="maps[selected.map].slides[selected.slide].media"
                        label="Media URL"
                      ></v-text-field>
                      <input type="file" id="uploadMedia" multiple="true" accept="image/*" style="display:none" @change="processFile($event, 'media')">
                      <v-btn
                        small
                        class="body-1"
                        @click="uploadMediaBtn"
                      >
                         Upload an Image
                        <v-icon right color="grey">cloud_upload</v-icon>
                      </v-btn>
                      <v-text-field
                        v-model="maps[selected.map].slides[selected.slide].credit"
                        label="Credit"
                      ></v-text-field>
                      <v-text-field
                        v-model="maps[selected.map].slides[selected.slide].caption"
                        label="Caption"
                      ></v-text-field>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex d-flex xs6>
                <v-card tile flat>
                  <v-card-text>
                    <v-form>
                      <v-text-field
                        v-model="maps[selected.map].slides[selected.slide].headline"
                        label="HEADLINE"
                      ></v-text-field>
                      <v-textarea
                        v-model="maps[selected.map].slides[selected.slide].content"
                        name="content"
                        label="Content"
                        hint="Hint text"
                        no-resize
                        height="70px"
                      ></v-textarea>
                      <v-btn
                        color="primary"
                        @click="optionUI = true"
                      >
                        Options
                      </v-btn>
                      <v-btn
                        color="primary"
                        @click="mapUI = true"
                      >
                        Map Options
                      </v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-layout>
        </v-layout>
        <v-dialog
          v-model="loginUI"
          max-width="300"
        >
          <v-card class="elevation-12">
            <v-toolbar dark color="info">
              <v-toolbar-title>Login form</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <div id="google-signin-btn"></div>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="delMapMsg"
          max-width="600"
        >
          <v-card>
            <v-card-title class="title">Delete {{ maps[selected.map].slides[0].headline === '' ? '(untitled)' : maps[selected.map].slides[0].headline }} map?</v-card-title>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn
                color="primary darken-1"
                flat="flat"
                @click="delMapMsg = false"
              >
                No
              </v-btn>

              <v-btn
                color="error darken-1"
                @click="delMap"
              >
                Yes
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="delSlideMsg"
          max-width="600"
        >
          <v-card>
            <v-card-title class="title">Delete {{ maps[selected.map].slides[selected.slide].headline === '' ? '(untitled)' : maps[selected.map].slides[selected.slide].headline }} slide?</v-card-title>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn
                color="primary darken-1"
                flat="flat"
                @click="delSlideMsg = false"
              >
                No
              </v-btn>

              <v-btn
                color="error darken-1"
                @click="delSlide"
              >
                Yes
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="optionUI"
          max-width="600"
        >
          <v-card>
            <v-toolbar dark color="info">
              <v-toolbar-title>Options</v-toolbar-title>
            </v-toolbar>
            <v-card-title class="headline">Slide Background</v-card-title>
            <v-card-text>
              <v-form>
                <v-text-field
                  v-model="maps[selected.map].slides[selected.slide].color"
                  label="Background Color"
                ></v-text-field>
                <chrome-picker :value="maps[selected.map].slides[selected.slide].color" @input="updateColor"></chrome-picker>
                <v-text-field
                  v-model="maps[selected.map].slides[selected.slide].background"
                  label="Background Image"
                ></v-text-field>
                <input type="file" id="uploadBackground" multiple="true" accept="image/*" style="display:none" @change="processFile($event, 'background')">
                <v-btn
                  small
                  class="body-1"
                  @click="uploadBackgroundBtn"
                >
                   Upload an Image
                  <v-icon right color="grey">cloud_upload</v-icon>
                </v-btn>
              </v-form>
            </v-card-text>

            <v-card-title class="headline">Map Markers</v-card-title>
            <v-card-text>
              <v-form>
                <v-text-field
                  v-model="maps[selected.map].slides[selected.slide].marker"
                  label="Marker Image"
                ></v-text-field>
                <input type="file" id="uploadMarker" multiple="true" accept="image/*" style="display:none" @change="processFile($event, 'marker')">
                <v-btn
                  small
                  class="body-1"
                  @click="uploadMarkerBtn"
                >
                   Upload an Image
                  <v-icon right color="grey">cloud_upload</v-icon>
                </v-btn>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary darken-1"
                flat="flat"
                @click="optionUI = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="mapUI"
          max-width="600"
        >
          <v-card>
            <v-toolbar dark color="info">
              <v-toolbar-title>Map Options</v-toolbar-title>
            </v-toolbar>
            <v-card-title class="headline">Map Type</v-card-title>
            <v-card-text>
              <v-select
                :items="maptype"
                @change="updateLayer"
                v-model="maps[selected.map].maptype"
                label="map type"
                solo
              ></v-select>
              <v-text-field
                v-if="maps[selected.map].maptype === 'Custom'"
                v-model="maps[selected.map].layer"
                @change="updateLayer(maps[selected.map].maptype)"
                label="Custom URL"
              ></v-text-field>
              <v-text-field
                v-if="maps[selected.map].maptype === 'Mapbox'"
                v-model="maps[selected.map].mapbox"
                @change="updateLayer(maps[selected.map].maptype)"
                label="Mapbox Style"
              ></v-text-field>
              <v-text-field
                v-if="maps[selected.map].maptype === 'Mapbox'"
                v-model="maps[selected.map].key"
                @change="updateLayer(maps[selected.map].maptype)"
                label="Mapbox Access token"
              ></v-text-field>
              <v-text-field
                v-if="maps[selected.map].maptype === 'Gigapixel'"
                v-model="maps[selected.map].zoomify.path"
                @change="updateLayer(maps[selected.map].maptype)"
                label="path"
              ></v-text-field>
              <v-text-field
                v-if="maps[selected.map].maptype === 'Gigapixel'"
                v-model="maps[selected.map].zoomify.width"
                @change="updateLayer(maps[selected.map].maptype)"
                label="width"
              ></v-text-field>
              <v-text-field
                v-if="maps[selected.map].maptype === 'Gigapixel'"
                v-model="maps[selected.map].zoomify.height"
                @change="updateLayer(maps[selected.map].maptype)"
                label="height"
              ></v-text-field>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary darken-1"
                flat="flat"
                @click="mapUI = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="listUI"
          max-width="600"
        >
          <v-card>
            <v-toolbar dark color="info">
              <v-toolbar-title>Manage</v-toolbar-title>
            </v-toolbar>
            <v-list two-line>
              <v-list-tile
                v-for="(map, index) in maps"
                class="slide"
                :key="index"
                @click="selectMap(index)"
                avatar
              >
                <v-list-tile-avatar>
                  <v-img
                    :src="map.slides[0].media"
                    aspect-ratio="2"
                    class="imgbg"
                  ></v-img>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title>{{ map.slides[0].headline === '' ? '(untitled)' : map.slides[0].headline }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ map.slides[0].content }}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action
                  v-if="index !== 0"
                  @click="selectDel(index, 'Map')"
                >
                  <v-btn icon ripple>
                    <v-icon color="error lighten-1">clear</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
              <v-list-tile
                @click="addMap"
                class="slide"
              >
                <v-list-tile-content>
                  <v-list-tile-title>Add Story</v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon color="success lighten-1">add_box</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary darken-1"
                flat="flat"
                @click="listUI = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
import gapi from 'gapi'
import VCO from 'VCO'
import L1 from 'L1'
import VueColor from 'vue-color'

let marker, lmap, smap, layer
let storage = 'storymapDB'

let defaultSlide = ({ id, loc, zoom }) => {
  let slide = {
    id,
    headline: '',
    content: '',
    zoom: zoom || 17,
    media: '',
    credit: '',
    caption: '',
    background: '',
    marker: '',
    color: '#FFFFFF'
  }

  if (loc === null) {
    slide.headline = 'overview'
  }

  if (loc || loc === null) {
    slide.loc = loc
  } else {
    slide.loc = [25.093703, 121.546028]
  }

  return slide
}

let defaultMap = ({ id, slides, layer }) => {
  return {
    id,
    maptype: 'Open Street Maps: Standard',
    version: '0.0.1',
    layer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    slides,
    mapbox: '',
    key: '',
    zoomify: {
      path: '',
      width: 0,
      height: 0
    }
  }
}

export default {
  components: {
    'chrome-picker': VueColor.Chrome
  },
  data () {
    let originData = {
      maps: [ defaultMap({
        id: this.uuid(),
        slides: [
          defaultSlide({
            id: this.uuid(),
            loc: null
          }),
          defaultSlide({
            id: this.uuid()
          })
        ]
      }) ],
      maptype: [
        'Open Street Maps: Standard',
        'Stamem Maps: Toner Lite',
        'Stamem Maps: Toner',
        'Stamem Maps: Toner Line',
        'Stamem Maps: Toner Labels',
        'Stamem Maps: Toner Background',
        'Stamem Maps: Watercolor',
        'Wikimedia Maps',
        'Custom',
        'Mapbox',
        'Gigapixel'
      ],
      layer: {
        osm: 'http://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        stamen: 'http://b.tile.stamen.com/{id}/{z}/{x}/{y}.png',
        wiki: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
        mapbox: 'https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}'
      },
      stamenId: {
        tonerLite: 'toner-lite',
        toner: 'toner',
        tonerLines: 'toner-lines',
        tonerLabels: 'toner-labels',
        tonerBackground: 'toner-background',
        watercolor: 'watercolor'
      },
      loginUI: false,
      optionUI: false,
      mapUI: false,
      listUI: false,
      previewUI: false,
      perviewBtn: 'preview',
      delSlideMsg: false,
      delMapMsg: false,
      loginStatus: null,
      username: 'username',
      selected: {
        map: 0,
        slide: 0,
        del: 0
      }
    }

    try {
      let maps = JSON.parse(localStorage.getItem(storage))
      if (maps.length > 0) {
        originData.maps = maps
      }
    } catch (err) {
      console.log(err)
    }
    return originData
  },
  updated () {
    try {
      let maps = this.maps.slice()
      localStorage.setItem(storage, JSON.stringify(maps))
      console.log(maps)
      this.sync()
    } catch (err) {
      console.log(err)
    }
  },
  mounted () {
    // google login
    gapi.signin2.render('google-signin-btn', {
      onSuccess: this.onSignIn
    })
    this.zoomify()
    this.setMap()
  },
  methods: {
    uuid () {
      let d = Date.now()
      if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now()
      }

      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)

        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      })
    },
    read (cb) {
      this.$http.get('/storymap/api/read')
        .then(res => {
          if (res.body) {
            cb(res.body)
          } else {
            console.log(res)
          }
        }, err => {
          console.log(err)
        })
    },
    publish () {
      this.$http.post('/storymap/api/publish', { id: this.maps[this.selected.map].id })
        .then(res => {
          if (res.body.status === 'ok') {
            window.open('/storymap/link/' + res.body.id)
          } else {
            console.log(res)
          }
        }, err => {
          console.log(err)
        })
    },
    sync (status = 'update', index, delId) {
      let id = status === 'update' ? this.maps[index || this.selected.map].id : delId
      this.$http.patch('/storymap/api/sync', {
        id,
        ...status === 'update' ? { map: JSON.stringify(this.maps[index || this.selected.map]) } : {},
        status: status || 'update'
      }).then(res => {
        if (res.body.status === 'ok') {
          console.log('synced')
          if (res.body.id) this.maps[index || this.selected.map].id = res.body.id
        } else {
          console.log(res)
        }
      }, err => {
        console.log(err)
      })
    },
    onSignIn (user) {
      let token = user.getAuthResponse().id_token
      this.$http.post('/storymap/api/login', { token: token })
        .then(res => {
          if (res.body.status === 'ok') {
            this.loginStatus = token
            this.loginUI = false
            this.username = user.getBasicProfile().getName()
            this.listUI = true
            this.read((data) => {
              if (data.length === 0) {
                this.sync()
              } else {
                this.maps = data
              }
            })
          }
        }, err => {
          console.log(err)
        })
    },
    addMap () {
      this.maps.push(defaultMap({
        id: this.uuid(),
        slides: [
          defaultSlide({
            id: this.uuid(),
            loc: null
          }),
          defaultSlide({
            id: this.uuid()
          })
        ]
      }))
      this.sync('update', this.maps.length - 1)
    },
    selectMap (index) {
      this.selected.map = index
      this.selectSlide(0)
      this.listUI = false
    },
    delMap () {
      if (this.selected.del !== 0) {
        let id = this.maps[this.selected.del].id
        this.selectMap(this.selected.del - 1)
        this.maps.splice(this.selected.del, 1)
        this.selected.del = 0
        this.delMapMsg = false
        this.$nextTick(function () {
          this.sync('delete', null, id)
        })
      }
    },
    addSlide () {
      let loc = lmap.getCenter()
      let zoom = lmap.getZoom()

      this.maps[this.selected.map].slides.push(defaultSlide({
        id: this.uuid(),
        loc: [loc.lat, loc.lng],
        zoom
      }))

      this.selectSlide(this.maps[this.selected.map].slides.length - 1)
    },
    selectSlide (index) {
      let originIndex = this.selected.slide
      this.selected.slide = index

      if (this.maps[this.selected.map].slides[index].loc !== null) {
        lmap.setView(this.maps[this.selected.map].slides[index].loc, this.maps[this.selected.map].slides[index].zoom)
      }

      if (this.maps[this.selected.map].slides[index].loc !== null &&
          this.maps[this.selected.map].slides[originIndex].loc === null) {
        this.addMarker()
      } else if (this.maps[this.selected.map].slides[index].loc === null &&
                 this.maps[this.selected.map].slides[originIndex].loc !== null) {
        marker.remove()
      } else if (this.maps[this.selected.map].slides[index].loc !== null &&
                 this.maps[this.selected.map].slides[originIndex].loc !== null) {
        marker.setLatLng(this.maps[this.selected.map].slides[index].loc)
      }
    },
    selectDel (index, type) {
      if (index !== 0) {
        this.selected.del = index
        this['del' + type + 'Msg'] = true
      }
    },
    delSlide () {
      if (this.selected.del !== 0) {
        if (this.selected.del === this.maps[this.selected.map].slides.lenght - 1 ||
            this.selected.del === this.selected.slide) {
          this.selectSlide(this.selected.slide - 1)
        }
        this.maps[this.selected.map].slides.splice(this.selected.del, 1)
        this.selected.del = 0
        this.delSlideMsg = false
      }
    },
    updateColor (data) {
      this.maps[this.selected.map].slides[this.selected.slide].color = data.hex
    },
    restore () {
      window.$('#uploadBackup').click()
    },
    backup () {
      localStorage.setItem(storage, JSON.stringify(this.maps))
      let mapData = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.maps))
      let dlElem = document.getElementById('downloadJSON')
      dlElem.setAttribute('href', mapData)
      dlElem.setAttribute('download', 'backup.json')
      dlElem.click()
    },
    processJSON (event, type) {
      let parser = new FileReader()
      let json
      parser.onload = (e) => {
        try {
          json = JSON.parse(e.target.result)
        } catch (err) {
          console.log(err)
        }

        if (typeof json === 'object') {
          this.maps = json
        }
      }

      parser.readAsText(event.target.files[0])
    },
    setPreview () {
      this.previewUI = !this.previewUI
      this.$nextTick(function () {
        if (!this.previewUI) {
          this.setMap()
          this.perviewBtn = 'Preview'
        } else {
          this.setStoryMap()
          this.perviewBtn = 'Edit'
        }
      })
    },
    setMap () {
      if (smap) {
        smap._el.map.remove()
        smap._el.menubar.remove()
        smap._el.storyslider.remove()
      }

      if (this.maps[this.selected.map].slides[this.selected.slide].loc !== null) {
        lmap = L1.map('map').setView(this.maps[this.selected.map].slides[this.selected.slide].loc, this.maps[this.selected.map].slides[this.selected.slide].zoom)
      } else {
        for (let i = this.selected.slide; i < this.maps[this.selected.map].slides.length; i++) {
          if (this.maps[this.selected.map].slides[i].loc !== null) {
            console.log(i)
            lmap = L1.map('map').setView(this.maps[this.selected.map].slides[i].loc, this.maps[this.selected.map].slides[i].zoom)
            break
          }
        }
      }

      window.lmap = lmap

      lmap.on('zoomend', () => {
        this.maps[this.selected.map].slides[this.selected.slide].zoom = lmap.getZoom()
      })

      this.updateLayer(this.maps[this.selected.map].maptype)

      new L1.Control.GPlaceAutocomplete({
        callback: (place) => {
          let loc = place.geometry.location
          let lat = loc.lat()
          let lng = loc.lng()

          this.maps[this.selected.map].slides[this.selected.slide].loc = [lat, lng]
          this.maps[this.selected.map].slides[this.selected.slide].zoom = lmap.getZoom()

          lmap.panTo([lat, lng])
          marker.setLatLng([lat, lng])

          let maps = this.maps.slice()
          localStorage.setItem(storage, JSON.stringify(maps))
          this.sync()
        }
      }).addTo(lmap)

      this.addMarker()
    },
    addMarker () {
      if (this.selected.slide !== 0) {
        marker = L1.marker(this.maps[this.selected.map].slides[this.selected.slide].loc, { title: 'point', alt: 'point', draggable: true })
          .addTo(lmap).on('dragend', () => {
            let coord = String(marker.getLatLng()).split(', ')
            let lat = coord[0].split('(')[1]
            let lng = coord[1].split(')')[0]

            this.maps[this.selected.map].slides[this.selected.slide].loc = [lat, lng]
            this.maps[this.selected.map].slides[this.selected.slide].zoom = lmap.getZoom()
            marker.bindPopup(lat + ', ' + lng)

            let maps = this.maps.slice()
            localStorage.setItem(storage, JSON.stringify(maps))
            this.sync()
          })
      }
    },
    updateLayer (name) {
      let mapLayer, mapId
      let nu = this.maptype.indexOf(name)

      switch (nu) {
        case 0:
          mapLayer = this.layer.osm
          break
        case 1:
          mapId = this.stamenId.tonerLite
          mapLayer = this.layer.stamen
          break
        case 2:
          mapId = this.stamenId.toner
          mapLayer = this.layer.stamen
          break
        case 3:
          mapId = this.stamenId.tonerLines
          mapLayer = this.layer.stamen
          break
        case 4:
          mapId = this.stamenId.tonerLabels
          mapLayer = this.layer.stamen
          break
        case 5:
          mapId = this.stamenId.tonerBackground
          mapLayer = this.layer.stamen
          break
        case 6:
          mapId = this.stamenId.watercolor
          mapLayer = this.layer.stamen
          break
        case 7:
          mapLayer = this.layer.wiki
          break
        case 8:
          mapLayer = this.maps[this.selected.map].layer
          break
      }

      let option = {
        maxZoom: 18
      }

      if (layer) {
        layer.remove()
      }

      if (nu <= 8) {
        mapLayer = mapId ? mapLayer.replace('{id}', mapId) : mapLayer
        layer = L1.tileLayer(mapLayer, option)
        lmap.addLayer(layer)

        this.maps[this.selected.map].layer = mapLayer
      } else if (nu === 9) {
        mapId = this.maps[this.selected.map].mapbox.replace(/mapbox:\/\/styles\//, '')
        mapLayer = this.layer.mapbox.replace('{id}', mapId) + '?access_token=' + this.maps[this.selected.map].key

        layer = L1.tileLayer(mapLayer, option)
        lmap.addLayer(layer)
      } else if (nu === 10) {
      }

      this.maps[this.selected.map].maptype = name

      console.log('mapID: ' + mapId)
      console.log('layer: ' + this.maps[this.selected.map].layer)
      console.log('mapLayer: ' + mapLayer)
      console.log('maptype: ' + this.maps[this.selected.map].maptype)
      this.sync()
    },
    zoomify () {
    },
    setStoryMap () {
      let slides = []

      let setStyle = (content, style) => {
        return `<div style='${style}'>
          ${content}
        </div>`
      }

      let map = this.maps[this.selected.map]

      for (let i = 0; i < map.slides.length; i++) {
        let s = map.slides[i]
        let slide = {
          date: '',
          location: {
            ...s.loc ? {
              lat: s.loc[0],
              lon: s.loc[1],
              zoom: s.zoom
            } : {},
            line: true
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
          slide.type = 'overview'
          delete slide.location.lat
          delete slide.location.lon
          delete slide.location.zoom
          delete slide.media
        }

        if (s.marker) {
          slide.location.use_custom_marker = true
          slide.location.icon = s.marker
          slide.location.iconSize = [48, 48]
        }

        slides.push(slide)
      }

      console.log('setmap layer:' + map.layer)
      let mapData = {
        calculate_zoom: false,
        storymap: {
          language: 'zh-tw',
          zoomify: false,
          map_type: map.layer,
          map_as_image: false,
          slides: slides
        }
      }

      if (map.maptype === 'Mapbox') {
        mapData.storymap.map_type = 'mapbox:' + map.mapbox
        mapData.storymap.map_access_token = map.key
      } else if (map.maptype === 'Gigapixel') {
        mapData.storymap.map_type = 'zoomify'
        mapData.storymap.zoomify = map.zoomify
      }

      console.log(mapData)

      let blob = new Blob([JSON.stringify(mapData)], { type: 'application/json' })
      let url = URL.createObjectURL(blob)

      smap = new VCO.StoryMap('storymap', url, {})
    },
    uploadMediaBtn () {
      window.$('#uploadMedia').click()
    },
    uploadMarkerBtn () {
      window.$('#uploadMarker').click()
    },
    uploadBackgroundBtn () {
      window.$('#uploadBackground').click()
    },
    processFile (event, type) {
      let formData = new FormData()
      formData.append('image', event.target.files[0])
      switch (type) {
        case 'background':
          this.$http.post('https://api.imgur.com/3/image', formData, {
            headers: {
              Authorization: 'Client-ID 35cfb005183d38f'
            }
          })
            .then(res => {
              this.maps[this.selected.map].slides[this.selected.slide].background = res.body.data.link
            }, err => {
              console.log(err)
            })
          break
        case 'media':
          this.$http.post('https://api.imgur.com/3/image', formData, {
            headers: {
              Authorization: 'Client-ID 35cfb005183d38f'
            }
          })
            .then(res => {
              this.maps[this.selected.map].slides[this.selected.slide].media = res.body.data.link
            }, err => {
              console.log(err)
            })
          break
        case 'marker':
          this.$http.post('https://api.imgur.com/3/image', formData, {
            headers: {
              Authorization: 'Client-ID 35cfb005183d38f'
            }
          })
            .then(res => {
              this.maps[this.selected.slide].slides[this.selected.slide].marker = res.body.data.link
            }, err => {
              console.log(err)
            })
          break
      }
    }
  }
}
</script>

<style scoped>
  .console {
    min-height: 300px;
  }

  .slideList {
    height: calc(100vh - 64px) !important;
    overflow: auto;
  }

  .slide:hover {
    background: rgba(0,0,0,0.12)
  }

  .map {
    height: calc(100vh - 364px) !important;
    width: 100%;
    z-index: 1 !important;
  }

  .storymap {
    height: calc(100vh - 65px) !important;
    width: 100%;
    background: #9e9e9e !important;
  }

  .toolbar {
    z-index: 999;
  }

  .imgbg {
    background: #9e9e9e !important;
  }

  .selected {
    background: rgba(0,0,0,0.12) !important;
  }
</style>
