import { onReady } from '@dcloudio/uni-app'
import { reactive } from 'vue'

const useSysTopBottom = (props: { top: number; bottom: number } = { top: 44, bottom: 50 }) => {
  const data = reactive({
    top: 0,
    bottom: 0,
  })

  function reset() {
    data.top = props.top
    data.bottom = props.bottom
  }

  onReady(async () => {
    reset()
    let systemInfo = await uni.getSystemInfo()
    if (systemInfo) {
      let top = systemInfo.statusBarHeight || 0
      let bottom = systemInfo?.safeAreaInsets?.bottom || 0
      data.top += top
      data.bottom += bottom
    }
  })

  return data
}

export default useSysTopBottom
