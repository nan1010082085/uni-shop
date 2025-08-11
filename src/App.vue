<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
onLaunch(() => {
  console.log('App Launch')
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
