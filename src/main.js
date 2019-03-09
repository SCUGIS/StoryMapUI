import Vue from 'vue'
import './plugins/vuetify'
import './plugins/vue-resource.js'
import App from './app.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
