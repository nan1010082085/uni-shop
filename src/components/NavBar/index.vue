<template>
  <u-navbar class="navbar-wrap" :autoBack="false" :title="props.title">
    <template #left>
      <slot v-if="slots.left" name="left"></slot>
      <view v-else-if="hideLeft" class="u-nav-slot">
        <u-icon name="arrow-left" size="19" @click="handleBack"></u-icon>
        <u-line direction="column" :hairline="false" length="16" margin="0 8px"></u-line>
        <u-icon name="home" size="20" @click="handleHome"></u-icon>
      </view>
      <view v-else-if="notTabbar">
        <u-icon name="arrow-left" size="19" @click="handleBack"></u-icon>
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
  hideLeft: {
    type: Boolean,
    default: undefined,
  },
})

const router = useRouter()
const route = useRoute()

// 不在tabbar的路由显示左侧返回按钮
const notTabbar = computed(() => {
  let path = getCurrentPages()[getCurrentPages().length - 1].route ?? ''
  console.log(tabbarPath.includes(`/${path}`))

  return !tabbarPath.includes(`/${path}`)
})
const hideLeft = computed(() => props.hideLeft)

const handleBack = () => {
  const redirect = decodeURIComponent(route.query.redirect)
  if (redirect) {
    if (tabbarPath.includes(`/${redirect}`)) {
      router.pushTab({
        path: `/${redirect}`,
      })
    } else {
      router.replace({
        path: redirect,
      })
    }
  } else {
    uni.navigateBack()
  }
}

const handleHome = () => {
  const index = `/pages/index/index`
  uni.switchTab({
    url: index,
  })
}
</script>

<style lang="scss" scoped>
.u-nav-slot {
  display: flex;
  align-items: center;
  justify-self: center;
  padding: 5rpx 10rpx;
  border-radius: 44rpx;
  height: var(--status-bar-height);
  border: 1rpx solid $u-border-color;
}
</style>
