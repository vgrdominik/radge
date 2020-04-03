import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';

// Font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
library.add(fab)

Vue.component('font-awesome-icon', FontAwesomeIcon)

// Axios

import axios from 'axios'

const base = axios.create({
  baseURL: 'http://api-radge.valentigamez.com'
});

Vue.prototype.$axios = base;

// Vuex
import store from './plugins/store'

// Router
import VueRouter from "vue-router"

Vue.use(VueRouter)

import routes from './plugins/routes'

const router = new VueRouter({
  mode: 'history',
  routes
})

// Global components
require('./plugins/global');

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
