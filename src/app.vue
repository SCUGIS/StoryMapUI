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
        v-show="loginStatus"
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
          <v-list-tile>
            <v-list-tile-title>My StoryMap</v-list-tile-title>
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
                v-for="(slide, index) in slides"
                :key="slide.id"
                avatar
                @click="selectSlide(index)"
                :class="slide.class"
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
                  @click="selectDel(index)"
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
                        :src="slides[slideSelected].media"
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
                        v-model="slides[slideSelected].media"
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
                        v-model="slides[slideSelected].credit"
                        label="Credit"
                      ></v-text-field>
                      <v-text-field
                        v-model="slides[slideSelected].caption"
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
                        v-model="slides[slideSelected].headline"
                        label="HEADLINE"
                      ></v-text-field>
                      <v-textarea
                        v-model="slides[slideSelected].content"
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
          v-model="delSlideMsg"
          max-width="600"
        >
          <v-card>
            <v-card-title class="title">Delete {{ slides[delSelected].headline === '' ? '(untitled)' : slides[delSelected].headline }} slide?</v-card-title>

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
                  v-model="slides[slideSelected].color"
                  label="Background Color"
                ></v-text-field>
                <chrome-picker :value="slides[slideSelected].color" @input="updateColor"></chrome-picker>
                <v-text-field
                  v-model="slides[slideSelected].background"
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
                  v-model="slides[slideSelected].marker"
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
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
import gapi from 'gapi'
import VCO from 'VCO'
import L1 from 'L1'
import VueColor from 'vue-color'

let marker, lmap, smap

export default {
  components: {
    'chrome-picker': VueColor.Chrome
  },
  data () {
    let originData = {
      slides: [
        {
          id: Math.random(),
          headline: '',
          content: '',
          loc: [25.045898, -238.474045],
          media: '',
          credit: '',
          caption: '',
          background: '',
          marker: '',
          color: '#FFFFFF',
          class: 'slide selected'
        }
      ],
      loginUI: false,
      optionUI: false,
      delSlideMsg: false,
      delMapMsg: false,
      loginStatus: null,
      previewUI: false,
      username: 'username',
      perviewBtn: 'preview',
      delSelected: 0,
      slideSelected: 0
    }

    try {
      let slides = JSON.parse(localStorage.getItem('slides'))

      for (let i = 0; i < slides.length; i++) {
        if (i === 0) {
          slides[i].class = 'slide selected'
        } else {
          slides[i].class = 'slide'
        }
      }

      if (slides.length > 0) {
        originData.slides = slides
      }
    } catch (err) {
      console.log(err)
    }
    return originData
  },
  updated () {
    try {
      let slides = this.slides.slice()
      localStorage.setItem('slides', JSON.stringify(slides))
    } catch (err) {
      console.log(err)
    }
  },
  mounted () {
    // google login
    gapi.signin2.render('google-signin-btn', {
      onSuccess: this.onSignIn
    })
    this.setMap()
  },
  methods: {
    publish () {
      this.$http.post('/storymap/api/map', { map: JSON.stringify(this.slides) })
        .then(res => {
          window.open('/storymap/link/' + res.body.res.id)
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
          }
        }, err => {
          console.log(err)
        })
    },
    addSlide () {
      this.slides.push({
        id: Math.random(),
        headline: '',
        content: '',
        loc: this.slides[this.slides.length - 1].loc,
        media: '',
        credit: '',
        caption: '',
        background: '',
        marker: '',
        color: '#FFFFFF',
        class: 'slide'
      })
    },
    selectSlide (index) {
      this.slides[this.slideSelected].class = 'slide'
      this.slides[index].class = 'slide selected'
      this.slideSelected = index

      lmap.setView(this.slides[index].loc)
      marker.setLatLng(this.slides[index].loc)
    },
    selectDel (index) {
      if (index !== 0) {
        this.delSelected = index
        this.delSlideMsg = true
      }
    },
    delSlide () {
      if (this.delSelected !== 0) {
        if (this.delSelected === this.slides.lenght - 1 ||
            this.delSelected === this.slideSelected) {
          this.selectSlide(this.slideSelected - 1)
        }
        this.slides.splice(this.delSelected, 1)
        this.delSelected = 0
        this.delSlideMsg = false
      }
    },
    updateColor (data) {
      this.slides[this.slideSelected].color = data.hex
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
      lmap = L1.map('map').setView(this.slides[this.slideSelected].loc, 20)

      L1.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(lmap)

      new L1.Control.GPlaceAutocomplete({
        callback: (place) => {
          let loc = place.geometry.location
          let lat = loc.lat()
          let lng = loc.lng()

          this.slides[this.slideSelected].loc = [lat, lng]

          lmap.panTo([lat, lng])
          marker.setLatLng([lat, lng])
          let slides = this.slides.slice()
          localStorage.setItem('slides', JSON.stringify(slides))
        }
      }).addTo(lmap)

      marker = L1.marker(this.slides[this.slideSelected].loc, { title: 'point', alt: 'point', draggable: true })
        .addTo(lmap).on('dragend', () => {
          let coord = String(marker.getLatLng()).split(', ')
          let lat = coord[0].split('(')[1]
          let lng = coord[1].split(')')[0]

          this.slides[this.slideSelected].loc = [lat, lng]
          marker.bindPopup(lat + ', ' + lng)
          let slides = this.slides.slice()
          localStorage.setItem('slides', JSON.stringify(slides))
        })
    },
    setStoryMap () {
      let slides = []

      for (let i = 0; i < this.slides.length; i++) {
        let s = this.slides[i]
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

      let map = {
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

      let blob = new Blob([JSON.stringify(map)], { type: 'application/json' })
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
              this.slides[this.slideSelected].background = res.body.data.link
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
              console.log(res.body.data.link)
              this.slides[this.slideSelected].media = res.body.data.link
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
              this.slides[this.slideSelected].marker = res.body.data.link
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
