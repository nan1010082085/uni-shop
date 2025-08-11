<template>
  <nav-bar title="我的足迹" />
  <view class="footprint-wrap">
    <!-- 足迹统计信息 -->
    <view class="footprint-stats">
      <view class="stats-item">
        <view class="stats-number">{{ footprintProducts.length }}</view>
        <view class="stats-label">浏览商品</view>
      </view>
      <view class="stats-item">
        <view class="stats-number">{{ todayViewCount }}</view>
        <view class="stats-label">今日浏览</view>
      </view>
    </view>

    <!-- 清空足迹按钮 -->
    <view class="clear-section" v-if="footprintProducts.length > 0">
      <u-button type="primary" size="small" plain @click="handleClearFootprint" text="清空足迹" />
    </view>

    <!-- 商品列表 -->
    <view class="products-section" v-if="footprintProducts.length > 0">
      <recommend-list :products="footprintProducts" @productClick="handleProductClick" />
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <u-empty mode="data" text="暂无浏览记录" textColor="#999" iconSize="120" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import RecommendList from '@/components/RecommendList/index.vue'
import { type Product } from '@/types/data.d'
import footprintData from '@/static/data/footprint.json'
import { useRouter } from '@/router'

/**
 * 足迹页面组件
 * 展示用户浏览过的商品历史记录
 */

const router = useRouter()

// 足迹商品数据
const footprintProducts = ref<Product[]>([])

/**
 * 计算今日浏览数量
 */
const todayViewCount = computed(() => {
  const today = new Date().toDateString()
  return footprintProducts.value.filter(product => {
    const viewDate = new Date(product.viewTime || '').toDateString()
    return viewDate === today
  }).length
})

/**
 * 加载足迹数据
 */
const loadFootprintData = () => {
  try {
    footprintProducts.value = footprintData.footprintProducts.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      description: item.description,
      tag: item.tag,
      viewTime: item.viewTime,
    }))
  } catch (error) {
    console.error('加载足迹数据失败:', error)
    uni.showToast({
      title: '加载数据失败',
      icon: 'error',
    })
  }
}

/**
 * 处理商品点击事件
 * @param product 商品信息
 */
const handleProductClick = (product: Product) => {
  console.log('点击足迹商品:', product)
  router.push({
    path: '/pages/commodity_details/index',
    query: {
      id: product.id.toString(),
      from: 'footprint',
    },
  })
}

/**
 * 清空足迹记录
 */
const handleClearFootprint = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有浏览记录吗？',
    success: res => {
      if (res.confirm) {
        footprintProducts.value = []
        uni.showToast({
          title: '已清空足迹',
          icon: 'success',
        })
      }
    },
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadFootprintData()
})
</script>

<style lang="scss" scoped>
.footprint-wrap {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 0 20rpx 20rpx;
  padding-top: 88rpx;
  // #ifdef MP-WEIXIN
  padding-top: 177rpx;
  // #endif
}

.footprint-stats {
  display: flex;
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.stats-item {
  flex: 1;
  text-align: center;

  &:first-child {
    border-right: 1rpx solid #eee;
  }
}

.stats-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff6b35;
  line-height: 1;
}

.stats-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.clear-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
}

.products-section {
  background: white;
  border-radius: 16rpx;
  padding: 0rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}
</style>
