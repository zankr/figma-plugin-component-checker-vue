import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Checker from '../views/Checker.vue'
// import Detail from '../views/Checker.vue'

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/checker',
        name: 'Checker',
        component: Checker
    }
]



export default createRouter({
  history: createWebHashHistory(),
  routes
})
