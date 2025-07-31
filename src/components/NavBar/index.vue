<template>
  <u-navbar class="navbar-wrap" :autoBack="false" :title="props.title">
    <template #left>
      <slot v-if="slots.left" name="left"></slot>
      <view v-else-if="hideLeft" class="u-nav-slot">
        <u-icon name="arrow-left" size="19" @click="handleBack"></u-icon>
        <u-line direction="column" :hairline="false" length="16" margin="0 8px"></u-line>
        <u-icon name="home" size="20" @click="handleHome"></u-icon>
      </view>
      <view v-else></view>
    </template>
    <template #right>
      <slot name="right"></slot>
    </template>
  </u-navbar>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from '@/router'
import { tabbarPath } from '@/utils/api_white_list'
import { computed, onMounted } from 'vue'
const slots = defineSlots<{ left: any; right: any }>()
const props = defineProps({
  title: {
    type: String,
    default: '标题',
    required: true,
  },
})

const router = useRouter()
const route = useRoute()

// 不在tabbar的路由显示左侧返回按钮
const hideLeft = computed(() => {
  console.log(route?.path)
  let path = getCurrentPages()[getCurrentPages().length - 1].route ?? ''
  return !tabbarPath.includes(`/${path}`)
})

const handleBack = () => {
  let page = getCurrentPages()
  let backRoute = page[page.length - 2].route
  if (tabbarPath.includes(`/${backRoute}`)) {
    router.pushTab(`/${backRoute}`)
  } else {
    uni.navigateBack()
  }
}

const handleHome = () => {
  const index = `/pages/index/index`
  router.pushTab(index)
}
</script>

<style lang="scss" scoped>
.u-nav-slot {
  display: flex;
  align-items: center;
  justify-self: center;
  padding: 5rpx 10rpx;
  border-radius: 44rpx;
  border: 1rpx solid $u-border-color;
}
</style>
