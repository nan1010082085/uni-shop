<template>
  <nav-bar title="由物商城" />
  <view class="index-page">
    <!-- 搜索栏 -->
    <view class="search-section">
      <search-bar
        placeholder="搜索商品"
        :show-action="false"
        shape="round"
        bg-color="#ffffff"
        @click="handleSearchClick"
      />
    </view>

    <!-- 轮播图 -->
    <view class="banner-section">
      <u-swiper
        :list="bannerList"
        :height="300"
        indicator
        indicator-mode="dot"
        indicator-active-color="#ff6b35"
        @click="handleBannerClick"
      />
    </view>

    <!-- 分类导航 -->
    <view class="category-section">
      <u-grid :col="5" :border="false">
        <u-grid-item v-for="(item, index) in categoryList" :key="index" @click="handleCategoryClick(item)">
          <view class="category-item">
            <image class="category-icon" :src="item.icon" mode="aspectFit" />
            <text class="category-name">{{ item.name }}</text>
          </view>
        </u-grid-item>
      </u-grid>
    </view>

    <!-- 活动横幅 -->
    <view class="activity-section">
      <u--image class="activity-banner" :src="activityBanner" width="100%" height="100%" @click="handleActivityClick" />
    </view>

    <!-- 热门商品 -->
    <view class="section-header pl-20 pr-20">
      <text class="section-title">热门商品</text>
      <view class="more-btn" @click="handleMoreClick">
        <text class="more-text">更多</text>
        <u-icon name="arrow-right" size="24rpx" color="#999" />
      </view>
    </view>
    <view class="hot-section">
      <u-grid :col="2">
        <u-grid-item
          v-for="(item, index) in hotProducts"
          :key="index"
          class="hot-product-item"
          @click="handleProductClick(item)"
        >
          <image class="product-image" :src="item.image" mode="widthFix" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-price">¥{{ item.price }}</text>
          </view>
        </u-grid-item>
      </u-grid>
    </view>

    <!-- 为你推荐 -->
    <view class="section-header pl-20">
      <text class="section-title">为你推荐</text>
    </view>
    <view class="recommend-section">
      <recommend-list :products="recommendProducts" @productClick="handleProductClick" />
    </view>

    <tab-bar :active="0" />
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar/index.vue'
import TabBar from '@/components/TabBar/index.vue'
import RecommendList from '@/components/RecommendList/index.vue'
import SearchBar from '@/components/SearchBar/index.vue'
import { ref, onMounted } from 'vue'
import homeData from '@/static/data/home.json'

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

// 定义分类接口
interface Category {
  id: number
  name: string
  icon: string
}

// 从JSON文件加载数据
const bannerList = ref(homeData.bannerList)
const categoryList = ref<Category[]>(homeData.categoryList)
const activityBanner = ref(homeData.activityBanner)
const hotProducts = ref<Product[]>(homeData.hotProducts)

// 推荐商品数据
const recommendProducts = ref<Product[]>([])

/**
 * 生成推荐商品数据
 */
const generateRecommendProducts = (): void => {
  const products: Product[] = []
  const productNames = homeData.recommendProductNames

  for (let i = 0; i < 30; i++) {
    products.push({
      id: 100 + i,
      name: productNames[i % productNames.length],
      price: Math.floor(Math.random() * 5000) + 100,
      image: `https://picsum.photos/200/300?random=${30 + i}`,
      description: '精选好物，品质保证',
      tag: i % 3 === 0 ? '热销' : i % 3 === 1 ? '新品' : '推荐',
    })
  }

  recommendProducts.value = products
}

// 事件处理函数
const handleSearchClick = () => {
  uni.navigateTo({
    url: '/pages/search/index',
  })
}

const handleBannerClick = (index: number) => {
  console.log('点击轮播图:', index)
}

const handleCategoryClick = (category: Category) => {
  console.log('点击分类:', category)
  // 跳转到分类页面
  uni.navigateTo({
    url: `/pages/category/index?id=${category.id}`,
  })
}

const handleActivityClick = () => {
  console.log('点击活动横幅')
}

const handleMoreClick = () => {
  console.log('点击更多')
  uni.navigateTo({
    url: '/pages/product/list',
  })
}

const handleProductClick = (product: Product) => {
  console.log('点击商品:', product)
  uni.navigateTo({
    url: `/pages/product/detail?id=${product.id}`,
  })
}

onMounted(() => {
  generateRecommendProducts()
})
</script>

<style lang="scss" scoped>
.index-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-top: 80rpx;
}

.search-section {
  padding: 20rpx;
}

.banner-section {
  margin: 10rpx 20rpx 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.category-section {
  margin: 20rpx;
  padding: 30rpx 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
}

.category-name {
  font-size: 24rpx;
  color: #333;
  text-align: center;
}

.activity-section {
  margin: 20rpx;
  height: 300rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.activity-banner {
  width: 100%;
  height: 100%;
}

.hot-section {
  margin: 20rpx;
  padding: 30rpx 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.more-btn {
  display: flex;
  align-items: center;
}

.more-text {
  font-size: 24rpx;
  color: #999;
  margin-right: 8rpx;
}

.hot-product-item {
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.product-image {
  width: 100%;
  height: 200rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 28rpx;
  color: #ff6b35;
  font-weight: bold;
}

.recommend-section {
  margin: 20rpx;
  padding: 30rpx 20rpx 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
}
</style>
