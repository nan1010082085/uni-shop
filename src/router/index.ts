import { createRouter } from '@gowiny/uni-router'
import PGAE_DATA from '@/pages.json'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { onMounted } from 'vue'

const router = createRouter({
  pageData: PGAE_DATA,
})

// router.beforeEach((to: any, from: any) => {
//   console.log('beforeEach', to, from)
// })

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

  // #ifdef APP-PLUS
  onLoad(options => {
    query = options
  })
  // #endif
  onMounted(() => {
    let len = getCurrentPages().length
    let instance: any = getCurrentPages()?.[len - 1] ?? {}
    // #ifdef APP-PLUS
    query = instance?.options ?? {}
    // #endif
    route.fullPath = instance.$page?.fullPath ?? ''
    route.type = instance.$page?.openType ?? ''
    route.path = instance.route ?? ''
    
    const pathQuery = resolverPathToQuery(route.fullPath)
    route.query = { ...pathQuery, ...query }
  })

  return route as Route
}

/**
 * 解析路径参数
 * @param path 路径
 * @returns 解析后的参数
 */
function resolverPathToQuery(path: string) {
  let data: any = {}
  if (path.indexOf('?') > -1) {
    let query = path.split('?')[1]
    let queryArr = query.split('&')
    queryArr.forEach(item => {
      let [key, value] = item.split('=')
      data[key] = decodeURIComponent(value)
    })
  }
  return data
}

export default router
