<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import useUserStore from './store/useUserStore'
onLaunch(() => {
  console.log('App Launch')
  // 初始化登陆状态
  // 判断是否已经登陆，判断登陆状态，luong.getUserInfo()
  const { getUserInfo } = useUserStore()
  console.log('App Launch', getUserInfo)
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>
<style lang="scss">
@import '@/uni_modules/uview-next/index.scss';
@import '@/styles/index.scss';

.uni-app--showtopwindow uni-page-head {
  display: none;
}
</style>
