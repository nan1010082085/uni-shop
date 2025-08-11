<template>
  <nav-bar title="我的收藏" />
  <view class="collect-container">
    <!-- 头部统计 -->
    <view class="header-stats">
      <text class="stats-text">共收藏 {{ collectList.length }} 件商品</text>
    </view>

    <!-- 商品列表 -->
    <view class="product-list" v-if="collectList.length > 0">
      <view class="product-item" v-for="item in collectList" :key="item.id" @click="handleProductClick(item)">
        <u-swipe-action>
          <u-swipe-action-item :options="swipeOptions" @click="handleSwipeClick($event, item)">
            <view class="product-content">
              <image class="product-image" :src="item.image" mode="aspectFill" />
              <view class="product-info">
                <text class="product-name">{{ item.name }}</text>
                <text class="product-desc">{{ item.description }}</text>
                <view class="product-tags">
                  <text class="product-tag" v-if="item.tag">{{ item.tag }}</text>
                  <text class="sales-text">已售{{ item.sales }}件</text>
                </view>
                <view class="price-row">
                  <text class="current-price">¥{{ item.price }}</text>
                  <text class="original-price" v-if="item.originalPrice && item.originalPrice > item.price"> ¥{{ item.originalPrice }} </text>
                </view>
                <text class="collect-time">收藏时间：{{ formatTime(item.collectTime) }}</text>
              </view>
              <view class="action-btn" @click.stop="handleRemoveCollect(item)">
                <u-icon name="heart-fill" color="#ff6b6b" size="20"></u-icon>
              </view>
            </view>
          </u-swipe-action-item>
        </u-swipe-action>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <u-icon name="heart" color="#cccccc" size="80"></u-icon>
      <text class="empty-text">暂无收藏商品</text>
      <text class="empty-desc">快去收藏心仪的商品吧~</text>
      <u-button type="primary" size="normal" @click="goShopping" custom-style="margin-top: 20px;"> 去逛逛 </u-button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import type { Product } from '@/types/data'
import collectData from '@/static/data/collect.json'

/**
 * 收藏商品接口，继承基础商品信息并添加收藏相关字段
 */
interface CollectProduct extends Product {
  collectTime: string
  sales: number
  stock: number
}

/**
 * 收藏商品列表
 */
const collectList = ref<CollectProduct[]>([])

/**
 * 滑动操作选项
 */
const swipeOptions = ref([
  {
    text: '取消收藏',
    style: {
      backgroundColor: '#ff6b6b',
    },
  },
])

/**
 * 加载收藏数据
 */
const loadCollectData = () => {
  collectList.value = collectData.collectProducts as CollectProduct[]
}

/**
 * 格式化时间
 * @param timeStr 时间字符串
 */
const formatTime = (timeStr: string): string => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * 处理商品点击
 * @param item 商品信息
 */
const handleProductClick = (item: Product) => {
  uni.navigateTo({
    url: `/pages/product/detail?id=${item.id}`,
  })
}

/**
 * 滑动操作事件接口
 */
interface SwipeEvent {
  index: number
  name: string
}

/**
 * 处理滑动操作点击
 * @param event 滑动事件
 * @param item 商品信息
 */
const handleSwipeClick = (event: SwipeEvent, item: Product) => {
  if (event.index === 0) {
    handleRemoveCollect(item)
  }
}

/**
 * 取消收藏
 * @param item 商品信息
 */
const handleRemoveCollect = (item: Product) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消收藏这件商品吗？',
    success: res => {
      if (res.confirm) {
        const index = collectList.value.findIndex(product => product.id === item.id)
        if (index > -1) {
          collectList.value.splice(index, 1)
          uni.showToast({
            title: '已取消收藏',
            icon: 'success',
          })
        }
      }
    },
  })
}

/**
 * 去购物
 */
const goShopping = () => {
  uni.switchTab({
    url: '/pages/index/index',
  })
}

/**
 * 页面加载时获取数据
 */
onMounted(() => {
  loadCollectData()
})
</script>

<style lang="scss" scoped>
.collect-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 88rpx;
  // #ifdef MP-WEIXIN
  padding-top: 177rpx;
  // #endif
}

.header-stats {
  background-color: #ffffff;
  padding: 30rpx 40rpx;
  border-bottom: 1px solid #f0f0f0;
}

.stats-text {
  font-size: 28rpx;
  color: #666666;
}

.product-list {
  padding: 20rpx 0;
}

.product-item {
  margin-bottom: 20rpx;
}

.product-content {
  background-color: #ffffff;
  padding: 30rpx;
  display: flex;
  align-items: flex-start;
  position: relative;
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.product-desc {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 16rpx;
  line-height: 1.3;
}

.product-tags {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.product-tag {
  background-color: #ff6b6b;
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  margin-right: 16rpx;
}

.sales-text {
  font-size: 22rpx;
  color: #999999;
}

.price-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.current-price {
  font-size: 36rpx;
  font-weight: 600;
  color: #ff6b6b;
  margin-right: 16rpx;
}

.original-price {
  font-size: 24rpx;
  color: #999999;
  text-decoration: line-through;
}

.collect-time {
  font-size: 22rpx;
  color: #cccccc;
}

.action-btn {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  padding: 10rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 40rpx;
  text-align: center;
}

.empty-text {
  font-size: 32rpx;
  color: #666666;
  margin-top: 40rpx;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999999;
}
</style>
