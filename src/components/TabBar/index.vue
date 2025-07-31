<template>
  <u-tabbar class="tabbar-wrap" :value="props.active" @change="handleChange">
    <u-tabbar-item
      v-for="(item, index) in list"
      :key="index"
      :icon="item.icon"
      :text="item.text"
      :page-path="item.pagePath"
    />
  </u-tabbar>
</template>
<script setup lang="ts">
import { useRouter } from '@/router'
import { onLoad } from '@dcloudio/uni-app'
const list = [
  {
    pagePath: 'pages/index/index',
    icon: 'home',
    text: '首页',
  },
  {
    pagePath: 'pages/classify/index',
    icon: 'list',
    text: '分类',
  },
  {
    pagePath: 'pages/cart/index',
    icon: 'shopping-cart',
    text: '购物车',
  },
  {
    pagePath: 'pages/my/index',
    icon: 'account',
    text: '我的',
  },
]
const props = defineProps<{ active: number }>()
const router = useRouter()
const handleChange = (index: number) => {
  router.pushTab({
    path: `/${list[index].pagePath}`,
  })
}
onLoad(() => {
  uni.hideTabBar()
})
</script>

<style lang="scss" scoped></style>
