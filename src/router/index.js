import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Checker from '../views/Checker.vue'
import Help from '../views/Help.vue'
import Component from '../views/Component.vue'
import Settings from '../views/Settings.vue'

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/checker',
        name: 'Checker',
        component: Checker
    },
    {
        path: '/help',
        name: 'Help',
        component: Help
    },
    {
        path: '/component',
        name: 'Component',
        component: Component
    },
    {
        path: '/settings',
        name: 'Settings',
        component: Settings
    }
]



export default createRouter({
  history: createWebHashHistory(),
  routes
})
