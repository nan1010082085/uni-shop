import { createRouter } from '@gowiny/uni-router'
import PGAE_DATA from '@/pages.json'
import { onLoad, onShow } from '@dcloudio/uni-app'

const router = createRouter({
  pageData: PGAE_DATA,
})

router.beforeEach((to, from) => {
  console.log('beforeEach', to, from)
})

// router.afterEach((to, from) => {
//   console.log('afterEach', to, from)
// })

export const useRouter = () => {
  return router
}

interface Route {
  fullPath: string
  path: string
  query: { [key: string]: string }
  [key: string]: any
}
export const useRoute = (): Route => {
  let route: any = {}
  let query: any = {}

  // #ifndef APP-PLUS
  onLoad(options => {
    query = options
  })
  // #endif
  onShow(() => {
    let len = getCurrentPages().length
    let instance: any = getCurrentPages()?.[len - 1] ?? {}
    // #ifndef APP-PLUS
    query = instance?.options ?? {}
    // #endif
    route.fullPath = instance.$page?.fullPath ?? ''
    route.type = instance.$page?.openType ?? ''
    route.path = instance.route ?? ''
    route.query = query
  })

  return route as Route
}

export default router
