import { createSSRApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import uView from '@/uni_modules/uview-next'
export function createApp() {
  const app = createSSRApp(App)
  app.use(router)
  app.use(store)
  app.use(uView)
  return {
    app,
  }
}
