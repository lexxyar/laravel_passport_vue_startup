import Vue from 'vue'
import router from './router'

import App from "./App.vue"
import "./../css/app.scss"

require('./bootstrap')


const app = new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app")
