import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import zhHant from 'vuetify/es5/locale/zh-Hant'

Vue.use(Vuetify, {
  theme: {
    primary: '#1976D2',
    secondary: '#90CAF9',
    accent: '#42A5F5',
    error: '#f44336',
    warning: '#ffeb3b',
    info: '#2196f3',
    success: '#4caf50'
  },
  iconfont: 'md',
  lang: {
    locales: { zhHant },
    current: 'zh-Hant'
  }
})
