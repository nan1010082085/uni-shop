<template>
  <view class="classify-wrap" :style="{ paddingTop: viewTopBottom.top + 'px' }">
    <!-- 搜索栏 -->
    <view class="classify-search" :style="{ paddingTop: viewTopBottom.top + 'px' }">
      <search-bar disabled @click="handleSearchClick" @search="handleSearch" @scan="handleScan" />
    </view>

    <!-- 分类内容 -->
    <view class="classify-content">
      <!-- 左侧分类列表 -->
      <scroll-view class="category-sidebar" scroll-y :scroll-top="sidebarScrollTop">
        <view
          v-for="(category, index) in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: activeIndex === index }"
          @click="handleCategoryClick(index)"
        >
          <text class="category-name">{{ category.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧商品列表 -->
      <scroll-view class="product-content" scroll-y :scroll-top="contentScrollTop" @scroll="handleContentScroll">
        <view
          v-for="(category, categoryIndex) in categories"
          :key="category.id"
          :id="`category-${categoryIndex}`"
          class="product-section"
        >
          <!-- 分类标题 -->
          <view class="section-title">
            <text class="title-text">{{ category.name }}</text>
          </view>

          <!-- 商品网格 -->
          <view class="product-grid">
            <view
              v-for="product in category.products"
              :key="product.id"
              class="product-item"
              @click="handleProductClick(product)"
            >
              <u-image
                :src="product.image"
                width="160rpx"
                height="160rpx"
                border-radius="16rpx"
                :show-loading="true"
                :show-error="true"
              />
              <view class="product-info">
                <text class="product-name">{{ product.name }}</text>
                <view class="product-price">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ product.price }}</text>
                  <text v-if="product.originalPrice" class="original-price"> ¥{{ product.originalPrice }} </text>
                </view>
                <view v-if="product.tag" class="product-tag">
                  <u-tag :text="product.tag" type="error" size="mini" plain />
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>

  <tab-bar :active="1" />
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, computed } from 'vue'
import TabBar from '@/components/TabBar/index.vue'
import SearchBar from '@/components/SearchBar/index.vue'
import classifyData from '@/static/data/classify.json'
import useSysTopBottom from '@/hooks/useSysTopBottom'

/**
 * 商品接口
 */
interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  tag?: string
}

/**
 * 分类接口
 */
interface Category {
  id: number
  name: string
  products: Product[]
}

const viewTopBottom = computed(() => {
  let _props = { top: 44, bottom: 50 }
  // #ifdef H5
  _props = { top: 0, bottom: 0 }
  // #endif
  // 获取系统顶部状态栏高度
  return useSysTopBottom(_props)
})

// 当前选中的分类索引
const activeIndex = ref(0)
// 侧边栏滚动位置
const sidebarScrollTop = ref(0)
// 内容区滚动位置
const contentScrollTop = ref(0)
// 是否正在程序化滚动
const isProgrammaticScroll = ref(false)

// 从JSON文件加载分类数据
const categories = reactive<Category[]>(classifyData as Category[])

/**
 * 处理搜索栏点击
 */
const handleSearchClick = (): void => {
  // uni.showToast({
  //   title: '跳转到搜索页面',
  //   icon: 'none'
  // })
}

/**
 * 处理搜索
 * @param value - 搜索值
 */
const handleSearch = (value: string): void => {
  uni.showToast({
    title: `搜索: ${value}`,
    icon: 'none',
  })
}

/**
 * 处理扫码
 */
const handleScan = (): void => {
  uni.showToast({
    title: '扫码功能',
    icon: 'none',
  })
}

/**
 * 处理分类点击
 * @param index - 分类索引
 */
const handleCategoryClick = (index: number): void => {
  activeIndex.value = index
  isProgrammaticScroll.value = true

  // 滚动到对应的商品区域
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query
      .select(`#category-${index}`)
      .boundingClientRect((data: any) => {
        if (data) {
          contentScrollTop.value = data.top - 100
          setTimeout(() => {
            isProgrammaticScroll.value = false
          }, 300)
        }
      })
      .exec()
  })
}

/**
 * 处理内容区滚动
 * @param event - 滚动事件
 */
const handleContentScroll = (event: any): void => {
  if (isProgrammaticScroll.value) return

  const scrollTop = event.detail.scrollTop

  // 根据滚动位置确定当前分类
  let currentIndex = 0
  const query = uni.createSelectorQuery()

  categories.forEach((_, index) => {
    query.select(`#category-${index}`).boundingClientRect((data: any) => {
      if (data && data.top <= 150) {
        currentIndex = index
      }
    })
  })

  query.exec(() => {
    if (currentIndex !== activeIndex.value) {
      activeIndex.value = currentIndex

      // 同步左侧滚动位置
      const itemHeight = 50
      const visibleHeight = 400
      const targetScrollTop = currentIndex * itemHeight - visibleHeight / 2
      sidebarScrollTop.value = Math.max(0, targetScrollTop)
    }
  })
}

/**
 * 处理商品点击
 * @param product - 商品信息
 */
const handleProductClick = (product: Product): void => {
  uni.showToast({
    title: `点击了 ${product.name}`,
    icon: 'none',
  })
}

onMounted(() => {
  // 初始化时设置默认选中第一个分类
  activeIndex.value = 0
})
</script>

<style lang="scss" scoped>
.classify-wrap {
  height: 100vh;
  margin: 0 auto;
  background-color: #fff;
  position: relative;
  overflow: hidden;
  // #ifdef MP-WEIXIN
  padding-top: 60px;
  // #endif
  display: flex;
  flex-direction: column;
}

.classify-search {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750rpx;
  z-index: 999;
  background-color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  // #ifdef MP-WEIXIN
  padding-top: 110rpx;
  // #endif
  // #ifdef APP-PLUS
  margin-top: -40px;
  padding-bottom: 20rpx;
  // #endif
}

.classify-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding-top: 44px;
  // #ifdef APP-PLUS
  padding-top: 22rpx;
  // #endif
}

.category-sidebar {
  width: 180rpx;
  background-color: #fff;
  border-right: 2rpx solid #e4e7ed;
  overflow: hidden;

  .category-item {
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 2rpx solid #f5f5f5;
    position: relative;

    &.active {
      background-color: #f5f5f5;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6rpx;
        height: 40rpx;
        background-color: #2979ff;
      }

      .category-name {
        color: #2979ff;
        font-weight: 500;
      }
    }

    .category-name {
      font-size: 24rpx;
      color: #606266;
      text-align: center;
      line-height: 1.2;
    }
  }
}

.product-content {
  flex: 1;
  background-color: #fff;

  .product-section {
    .section-title {
      padding: 30rpx;
      background-color: #f8f9fa;
      border-bottom: 2rpx solid #e4e7ed;

      .title-text {
        font-size: 32rpx;
        font-weight: 500;
        color: #303133;
      }
    }

    .product-grid {
      padding: 20rpx;

      .product-item {
        display: flex;
        padding: 20rpx;
        border-bottom: 2rpx solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        .product-info {
          flex: 1;
          margin-left: 24rpx;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .product-name {
            font-size: 28rpx;
            color: #303133;
            line-height: 1.4;
            margin-bottom: 16rpx;
          }

          .product-price {
            display: flex;
            align-items: baseline;
            margin-bottom: 16rpx;

            .price-symbol {
              font-size: 24rpx;
              color: #fa3534;
            }

            .price-value {
              font-size: 32rpx;
              font-weight: 500;
              color: #fa3534;
              margin-right: 16rpx;
            }

            .original-price {
              font-size: 24rpx;
              color: #909399;
              text-decoration: line-through;
            }
          }

          .product-tag {
            align-self: flex-start;
          }
        }
      }
    }
  }
}
</style>
