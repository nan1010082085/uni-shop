<template>
  <nav-bar title="商品详情" :hideLeft="false"></nav-bar>

  <view class="product-detail">
    <!-- 商品轮播图 -->
    <view class="product-images">
      <swiper
        class="swiper"
        :indicator-dots="true"
        :autoplay="false"
        :interval="3000"
        :duration="500"
        indicator-color="rgba(255, 255, 255, 0.5)"
        indicator-active-color="#ff6b35"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(image, index) in productDetail.images" :key="index">
          <image :src="image" class="product-image" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view class="image-indicator"> {{ currentImageIndex + 1 }}/{{ productDetail.images.length }} </view>
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <view class="price-section">
        <view class="current-price">¥{{ selectedPrice }}</view>
        <view v-if="productDetail.originalPrice" class="original-price"> ¥{{ productDetail.originalPrice }} </view>
        <view v-if="productDetail.tag" class="product-tag">{{ productDetail.tag }}</view>
      </view>

      <view class="product-title">{{ productDetail.name }}</view>
      <view class="product-desc">{{ productDetail.description }}</view>

      <view class="sales-info">
        <text>已售 {{ productDetail.sales }}件</text>
        <text>库存 {{ productDetail.stock }}件</text>
      </view>
    </view>

    <!-- 规格选择 -->
    <view class="spec-section">
      <view class="spec-title">选择规格</view>
      <view v-for="spec in productDetail.specifications" :key="spec.id" class="spec-group">
        <view class="spec-name">{{ spec.name }}</view>
        <view class="spec-options">
          <view
            v-for="option in spec.options"
            :key="option.id"
            class="spec-option"
            :class="{ active: selectedSpecs[spec.id] === option.id }"
            @click="selectSpec(spec.id, option.id, option.price)"
          >
            {{ option.name }}
            <text v-if="option.price && option.price !== productDetail.price" class="option-price">
              +¥{{ option.price - productDetail.price }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="product-details">
      <view class="details-title">商品详情</view>
      <view class="details-content">{{ productDetail.details }}</view>
    </view>

    <!-- 用户评价 -->
    <view class="reviews-section">
      <view class="reviews-title">用户评价 ({{ productDetail.reviews.length }})</view>
      <view v-for="review in productDetail.reviews.slice(0, 3)" :key="review.id" class="review-item">
        <view class="review-header">
          <image :src="review.avatar" class="user-avatar" />
          <view class="user-info">
            <view class="user-name">{{ review.userName }}</view>
            <view class="review-time">{{ review.createTime }}</view>
          </view>
          <view class="rating">
            <text v-for="i in 5" :key="i" class="star" :class="{ active: i <= review.rating }">★</text>
          </view>
        </view>
        <view class="review-content">{{ review.content }}</view>
        <view v-if="review.images" class="review-images">
          <image v-for="(img, index) in review.images" :key="index" :src="img" class="review-image" />
        </view>
      </view>
      <view class="view-all-reviews">查看全部评价 ></view>
    </view>
  </view>

  <!-- 底部操作栏 -->
  <view class="bottom-actions">
    <view class="action-left">
      <view class="action-item" @click="contactService">
        <u-icon name="chat" size="24" color="#666"></u-icon>
        <text>客服</text>
      </view>
      <view class="action-item" @click="toggleFavorite">
        <u-icon :name="isFavorite ? 'heart-fill' : 'heart'" size="24" :color="isFavorite ? '#ff6b35' : '#666'"></u-icon>
        <text>收藏</text>
      </view>
    </view>

    <view class="action-right">
      <view class="add-cart-btn" @click="addToCart"> 加入购物车 </view>
      <view class="buy-now-btn" @click="buyNow"> 立即购买 </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import type { ProductDetail } from '@/types/data'
import productDetailData from '@/static/data/product-detail.json'

/**
 * 当前轮播图索引
 */
const currentImageIndex = ref(0)

/**
 * 选中的规格
 */
const selectedSpecs = ref<Record<number, number>>({})

/**
 * 是否收藏
 */
const isFavorite = ref(false)

/**
 * 商品详情数据
 */
const productDetail = ref<ProductDetail>(productDetailData.productDetail)

/**
 * 计算选中规格后的价格
 */
const selectedPrice = computed(() => {
  let price = productDetail.value.price

  // 遍历选中的规格，计算最终价格
  Object.entries(selectedSpecs.value).forEach(([specId, optionId]) => {
    const spec = productDetail.value.specifications.find(s => s.id === Number(specId))
    const option = spec?.options.find(o => o.id === optionId)
    if (option?.price) {
      price = option.price
    }
  })

  return price
})

/**
 * 轮播图切换事件
 */
const onSwiperChange = (e: any) => {
  currentImageIndex.value = e.detail.current
}

/**
 * 选择规格
 */
const selectSpec = (specId: number, optionId: number, price?: number) => {
  selectedSpecs.value[specId] = optionId
}

/**
 * 联系客服
 */
const contactService = () => {
  uni.showToast({
    title: '正在联系客服...',
    icon: 'none',
  })
}

/**
 * 切换收藏状态
 */
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  uni.showToast({
    title: isFavorite.value ? '已收藏' : '已取消收藏',
    icon: 'none',
  })
}

/**
 * 加入购物车
 */
const addToCart = () => {
  // 检查是否选择了所有必要规格
  const requiredSpecs = productDetail.value.specifications.filter(spec => spec.options.length > 1)
  const selectedSpecIds = Object.keys(selectedSpecs.value).map(Number)

  const missingSpecs = requiredSpecs.filter(spec => !selectedSpecIds.includes(spec.id))

  if (missingSpecs.length > 0) {
    uni.showToast({
      title: `请选择${missingSpecs[0].name}`,
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: '已加入购物车',
    icon: 'success',
  })
}

/**
 * 立即购买
 */
const buyNow = () => {
  // 检查是否选择了所有必要规格
  const requiredSpecs = productDetail.value.specifications.filter(spec => spec.options.length > 1)
  const selectedSpecIds = Object.keys(selectedSpecs.value).map(Number)

  const missingSpecs = requiredSpecs.filter(spec => !selectedSpecIds.includes(spec.id))

  if (missingSpecs.length > 0) {
    uni.showToast({
      title: `请选择${missingSpecs[0].name}`,
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: '正在跳转到订单页面...',
    icon: 'none',
  })
}

/**
 * 页面加载时初始化默认规格
 */
onMounted(() => {
  // 默认选择第一个规格选项
  productDetail.value.specifications.forEach(spec => {
    if (spec.options.length > 0) {
      selectedSpecs.value[spec.id] = spec.options[0].id
    }
  })
})
</script>

<style lang="scss" scoped>
@import '@/styles/variable.scss';

.product-detail {
  padding-bottom: 120rpx;
}

// 商品轮播图
.product-images {
  position: relative;
  height: 50vh;

  .swiper {
    height: 100%;
  }

  .product-image {
    width: 100%;
    height: 100%;
  }

  .image-indicator {
    position: absolute;
    bottom: 20rpx;
    right: 20rpx;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
  }
}

// 商品信息
.product-info {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;

  .price-section {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .current-price {
      font-size: 48rpx;
      font-weight: bold;
      color: $shop-text-color;
      margin-right: 20rpx;
    }

    .original-price {
      font-size: 28rpx;
      color: #999;
      text-decoration: line-through;
      margin-right: 20rpx;
    }

    .product-tag {
      background: $shop-text-color;
      color: white;
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      font-size: 20rpx;
    }
  }

  .product-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
    line-height: 1.4;
  }

  .product-desc {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
    line-height: 1.4;
  }

  .sales-info {
    display: flex;
    gap: 40rpx;
    font-size: 24rpx;
    color: #999;
  }
}

// 规格选择
.spec-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .spec-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
  }

  .spec-group {
    margin-bottom: 30rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .spec-name {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
    }

    .spec-options {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .spec-option {
        padding: 16rpx 24rpx;
        border: 2rpx solid #e5e5e5;
        border-radius: 8rpx;
        font-size: 26rpx;
        color: #333;
        background: #f8f8f8;
        transition: all 0.3s;

        &.active {
          border-color: $shop-text-color;
          background: rgba(255, 107, 53, 0.1);
          color: $shop-text-color;
        }

        .option-price {
          font-size: 22rpx;
          color: $shop-text-color;
          margin-left: 8rpx;
        }
      }
    }
  }
}

// 商品详情
.product-details {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .details-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .details-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

// 用户评价
.reviews-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .reviews-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
  }

  .review-item {
    padding-bottom: 30rpx;
    margin-bottom: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .review-header {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      .user-avatar {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }

      .user-info {
        flex: 1;

        .user-name {
          font-size: 26rpx;
          color: #333;
          margin-bottom: 8rpx;
        }

        .review-time {
          font-size: 22rpx;
          color: #999;
        }
      }

      .rating {
        .star {
          color: #ddd;
          font-size: 24rpx;

          &.active {
            color: #ffa500;
          }
        }
      }
    }

    .review-content {
      font-size: 28rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 16rpx;
    }

    .review-images {
      display: flex;
      gap: 16rpx;

      .review-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 8rpx;
      }
    }
  }

  .view-all-reviews {
    text-align: center;
    color: $shop-text-color;
    font-size: 28rpx;
    padding: 20rpx 0;
  }
}

// 底部操作栏
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #e5e5e5;
  display: flex;
  align-items: center;
  z-index: 999;

  .action-left {
    display: flex;
    gap: 40rpx;
    margin-right: 30rpx;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;

      text {
        font-size: 20rpx;
        color: #666;
      }
    }
  }

  .action-right {
    flex: 1;
    display: flex;
    gap: 20rpx;

    .add-cart-btn {
      flex: 1;
      background: rgba(255, 107, 53, 0.1);
      color: $shop-text-color;
      text-align: center;
      padding: 24rpx 0;
      border-radius: 50rpx;
      font-size: 28rpx;
      font-weight: bold;
      border: 2rpx solid $shop-text-color;
    }

    .buy-now-btn {
      flex: 1;
      background: $shop-text-color;
      color: white;
      text-align: center;
      padding: 24rpx 0;
      border-radius: 50rpx;
      font-size: 28rpx;
      font-weight: bold;
    }
  }
}
</style>
