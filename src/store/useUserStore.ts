import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

const useUserStore = defineStore('user', () => {
  // token 存储在内存并未做持久化
  const token = reactive({
    value: '',
    time: 0,
  })

  const userInfo = ref<userInfoT | null>(null)

  const setUserInfo = (info: userInfoT | null = null) => {
    userInfo.value = info
  }

  const getUserInfo = computed(() => {
    return userInfo.value
  })

  const setToken = (t: string) => {
    token.value = t
    token.time = new Date().getTime()
  }

  const getToken = computed(() => {
    return token.value
  })

  const getTokenTime = computed(() => {
    return token.time
  })

  // 刷新token
  const refreshToken = () => {
    setToken('')
  }

  return {
    setToken,
    getToken,
    getTokenTime,
    setUserInfo,
    getUserInfo,
    refreshToken,
  }
})

interface userInfoT {
  id: string
  name: string
  avatar: string
}

export default useUserStore
