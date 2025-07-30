// https://www.quanzhan.co/luch-request/guide/3.x/#luch-request-api
import useUserStore from '@/store/useUserStore'
import { tokenWhiteList } from '@/utils/api_white_list'
import  request, { type HttpRequestConfig } from 'luch-request'

const http = new request()

http.setConfig(config => { 
  config.baseURL = import.meta.env.VITE_BASE_URL;
  return config
})

// 请求拦截器
http.interceptors.request.use((config: HttpRequestConfig) => {
  // token白名单不验证
  if (config.url && !tokenWhiteList.includes(config.url)) {
    const { getToken, getTokenTime, refreshToken } = useUserStore()

    // 假设token过期10分钟，9分钟内刷新token
    if (Date.now() - getTokenTime > 1000 * 60 * 60 * 9) {
      refreshToken()
    }
    
    config.header = {
      ...config.header,
      Authorization: 'Bearer ' + getToken,
    }
  }
  console.log('请求拦截器', config)
  return config
})

// 响应拦截器
http.interceptors.response.use(
  response => {
    return response
  },
  response => {
    return Promise.reject(response)
  },
)

export default http
