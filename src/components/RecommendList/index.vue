<!-- 推荐产品，瀑布流 -->
<template>
  <waterfall v-model="waterfallData" ref="uWaterfall" :column="2">
    <template #default="{ columnList, columnIndex }">
      <view class="demo-warter" v-for="(item, index) in columnList" :key="index" @click="() => handleProductClick(item)">
        <u-lazy-load threshold="-200" border-radius="10" :image="item.image" :index="index"></u-lazy-load>
        <view class="demo-title">{{ item.name }}</view>
        <view class="demo-desc">{{ item.description }}</view>
        <view class="demo-tag" v-if="item.tag">
          <view class="demo-tag-text">{{ item.tag }}</view>
        </view>
        <view class="demo-price">{{ item.price }}元</view>
      </view>
    </template>
  </waterfall>
</template>

<script setup lang="ts">
// import { $u } from '@/utils'
import { onReachBottom } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'
// 引入瀑布流组件
// pages设置失效
import waterfall from '@/uni_modules/uview-next/components/u-waterfall/u-waterfall.vue'
import { useRoute, useRouter } from '@/router'

defineOptions({
  component: [waterfall],
})

// 定义商品接口
interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  description?: string
  tag?: string
}

// 定义组件props
interface WaterfallProps {
  products: Product[]
}

const props = defineProps<WaterfallProps>()

// 定义emit事件
const emit = defineEmits<{
  productClick: [product: Product]
}>()

const router = useRouter()
const route = useRoute()

// uView waterfall组件的数据
const waterfallData = ref<Product[]>([])
const uWaterfall = ref()

/**
 * 处理商品点击事件
 * @param product 商品信息
 */
const handleProductClick = (product: Product) => {
  console.log('点击商品:', product)
  // 触发父组件的商品点击事件
  emit('productClick', product)
}

// 监听props变化，更新瀑布流数据
watch(
  () => props.products,
  newProducts => {
    let list = JSON.parse(JSON.stringify(newProducts))
    // for (let i = 0; i < 10; i++) {
    //   let index = $u.random(0, list.length - 1)
    //   // 先转成字符串再转成对象，避免数组对象引用导致数据混乱
    //   let item = JSON.parse(JSON.stringify(list[index]))
    //   item.id = $u.guid()
    //   waterfallData.value.push(item)
    // }

    waterfallData.value.push(...list)
    console.log('更新瀑布流数据:', waterfallData.value)

    // 等待DOM更新后重新计算瀑布流
    // setTimeout(() => {
    //   if (uWaterfall.value) {
    //     uWaterfall.value.clear()
    //     uWaterfall.value.add(newProducts)
    //   }
    // }, 16)
  },
  { immediate: true, deep: true },
)

onReachBottom(() => {
  console.log('上拉加载更多')
  // 这里可以添加上拉加载更多的逻辑
})
</script>

<style lang="scss" scoped>
.waterfall-wrapper {
  padding: 0 20rpx;
}

.demo-warter {
  border-radius: 16rpx;
  margin: 10rpx;
  background-color: #ffffff;
  position: relative;
}

.u-close {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
}

.demo-image {
  width: 100%;
  border-radius: 8rpx;
}

.demo-title {
  font-size: 28rpx;
  margin-top: 10rpx;
  color: $u-main-color;
}

.demo-desc {
  font-size: 22rpx;
  margin-top: 5rpx;
  color: $u-tips-color;
}

.demo-tag {
  display: flex;
  margin-top: 10rpx;
}

.demo-tag-owner {
  background-color: $u-error;
  color: #ffffff;
  display: flex;
  align-items: center;
  padding: 4rpx 14rpx;
  border-radius: 50rpx;
  font-size: 20rpx;
  line-height: 1;
}

.demo-tag-text {
  border: 1px solid $u-primary;
  color: $u-primary;
  border-radius: 50rpx;
  line-height: 1;
  padding: 4rpx 14rpx;
  display: flex;
  align-items: center;
  border-radius: 50rpx;
  font-size: 20rpx;
}

.demo-price {
  font-size: 30rpx;
  color: $u-error;
  margin-top: 5px;
}

.demo-shop {
  font-size: 22rpx;
  color: $u-tips-color;
  margin-top: 5px;
}
</style>
