import { createRouter, createWebHistory } from 'vue-router'
import LotteryView from '../views/LotteryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'lottery',
      component: LotteryView
    }
  ]
})

export default router
