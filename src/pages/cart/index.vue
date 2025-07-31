<template>
  <nav-bar title="购物车">
    <template #right>
      <text class="edit-btn" @click="toggleEditMode">
        {{ isEditMode ? '完成' : '编辑' }}
      </text>
    </template>
  </nav-bar>
  <view class="cart-page">
    <view class="cart-content">
      <!-- 购物车为空 -->
      <view v-if="cartItems.length === 0" class="empty-cart">
        <u-icon name="shopping-cart" size="120" color="#c8c9cc"></u-icon>
        <text class="empty-text">购物车还是空的</text>
        <text class="empty-desc">快去挑选心仪的商品吧~</text>
        <u-button type="primary" text="去购物" @click="goShopping"></u-button>
      </view>

      <!-- 购物车商品列表 -->
      <view v-else class="cart-list">
        <!-- 全选区域 -->
        <view class="select-all">
          <u-checkbox v-model="selectAll" @change="handleSelectAll" active-color="#ff6b35"> 全选 </u-checkbox>
          <text class="total-count">共{{ cartItems.length }}件商品</text>
        </view>

        <!-- 商品列表 -->
        <view class="item-list">
          <u-swipe-action>
            <u-swipe-action-item
              v-for="(item, index) in cartItems"
              :key="item.id"
              :options="swipeOptions"
              @click="() => handleSwipeClick(index, item)"
            >
              <view class="cart-item">
                <view class="item-select">
                  <u-checkbox v-model="item.selected" @change="handleItemSelect" active-color="#ff6b35"></u-checkbox>
                </view>

                <view class="item-image">
                  <u-image
                    :src="item.image"
                    width="160rpx"
                    height="160rpx"
                    border-radius="12rpx"
                    mode="aspectFill"
                  ></u-image>
                </view>

                <view class="item-info">
                  <view class="item-name">{{ item.name }}</view>
                  <view v-if="item.color" class="item-spec">{{ item.color }}</view>
                  <view v-if="item.tag" class="item-tag">
                    <u-tag :text="item.tag" type="error" size="mini" plain></u-tag>
                  </view>

                  <view class="item-bottom">
                    <view class="item-price">
                      <text class="price-symbol">¥</text>
                      <text class="price-value">{{ item.price.toFixed(2) }}</text>
                      <text v-if="item.originalPrice" class="original-price">
                        ¥{{ item.originalPrice.toFixed(2) }}
                      </text>
                    </view>

                    <view class="item-quantity">
                      <u-number-box
                        v-model="item.quantity"
                        :min="1"
                        :max="item.stock"
                        @change="handleQuantityChange"
                        button-size="60rpx"
                        input-width="80rpx"
                        input-height="60rpx"
                      ></u-number-box>
                    </view>
                  </view>
                </view>
              </view>
            </u-swipe-action-item>
          </u-swipe-action>
        </view>
      </view>

      <!-- 猜你喜欢 -->
      <view class="section-title">
        <u-icon name="heart" color="#ff6b35" size="32"></u-icon>
        <text class="title-text">猜你喜欢</text>
      </view>
      <view v-if="recommendProducts.length > 0" class="recommend-section">
        <RecommendList :products="recommendProducts" />
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view v-if="cartItems.length > 0" class="cart-footer">
      <view class="footer-left">
        <u-checkbox v-model="selectAll" @change="handleSelectAll" active-color="#ff6b35"> 全选 </u-checkbox>
      </view>

      <view class="footer-center">
        <view class="total-info">
          <text class="total-label">合计(不含运费):</text>
          <view class="total-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ totalAmount.toFixed(2) }}</text>
          </view>
        </view>
        <view v-if="savedAmount > 0" class="saved-amount"> 已优惠 ¥{{ savedAmount.toFixed(2) }} </view>
      </view>

      <view class="footer-right">
        <u-button
          type="primary"
          :text="isEditMode ? `删除(${selectedCount})` : `结算(${selectedCount})`"
          :disabled="selectedCount === 0"
          @click="handleCheckout"
          custom-style="background: #ff6b35; border-color: #ff6b35;"
        ></u-button>
      </view>
    </view>
  </view>
  <tab-bar :active="2" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import TabBar from '@/components/TabBar/index.vue'
import RecommendList from '@/components/RecommendList/index.vue'
import http from '@/api/request'
import { uToast } from '@/utils'

/**
 * 购物车商品接口
 */
interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  color?: string
  quantity: number
  selected: boolean
  stock: number
  tag?: string
}

/**
 * 推荐商品接口
 */
interface RecommendProduct {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  description?: string
  tag?: string
}

/**
 * 购物车数据接口
 */
interface CartData {
  cartItems: CartItem[]
  recommendProducts: RecommendProduct[]
}

// 响应式数据
const cartItems = ref<CartItem[]>([])
const recommendProducts = ref<RecommendProduct[]>([])
const isEditMode = ref<boolean>(false)

// 左滑删除选项
const swipeOptions = [
  {
    text: '删除',
    style: {
      backgroundColor: '#fa3534',
    },
  },
]

/**
 * 全选状态
 */
const selectAll = computed({
  get: () => {
    return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
  },
  set: (value: boolean) => {
    cartItems.value.forEach(item => {
      item.selected = value
    })
  },
})

/**
 * 已选商品数量
 */
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

/**
 * 总金额
 */
const totalAmount = computed(() => {
  return cartItems.value.filter(item => item.selected).reduce((total, item) => total + item.price * item.quantity, 0)
})

/**
 * 优惠金额
 */
const savedAmount = computed(() => {
  return cartItems.value
    .filter(item => item.selected && item.originalPrice)
    .reduce((total, item) => {
      const saved = (item.originalPrice! - item.price) * item.quantity
      return total + saved
    }, 0)
})

/**
 * 加载购物车数据
 */
const loadCartData = async (): Promise<void> => {
  try {
    // 模拟从静态文件加载数据
    const response = await http.get('/static/data/cart.json')
    const data: CartData = response.data

    cartItems.value = data.cartItems
    recommendProducts.value = data.recommendProducts
  } catch (error) {
    console.error('加载购物车数据失败:', error)
    // 使用默认数据
    initDefaultData()
  }
}

/**
 * 初始化默认数据
 */
const initDefaultData = (): void => {
  cartItems.value = [
    {
      id: 1,
      name: '小米30W磁吸无线充',
      price: 149.0,
      originalPrice: 199.0,
      image: '/static/logo.png',
      color: '白色',
      quantity: 1,
      selected: true,
      stock: 99,
      tag: '热销',
    },
    {
      id: 2,
      name: 'Xiaomi Buds 5',
      price: 699.0,
      originalPrice: 799.0,
      image: '/static/logo.png',
      color: '钛光金',
      quantity: 1,
      selected: true,
      stock: 50,
      tag: '3期免息',
    },
  ]

  recommendProducts.value = [
    {
      id: 101,
      name: '小米手环8 Pro',
      price: 399,
      originalPrice: 499,
      image: '/static/logo.png',
      tag: '新品',
      description: '健康监测 | 运动追踪',
    },
  ]
}

/**
 * 切换编辑模式
 */
const toggleEditMode = (): void => {
  isEditMode.value = !isEditMode.value
}

/**
 * 处理全选
 */
const handleSelectAll = (): void => {
  // selectAll的setter会自动处理
}

/**
 * 处理单个商品选择
 */
const handleItemSelect = (): void => {
  // 响应式数据会自动更新计算属性
}

/**
 * 处理数量变化
 */
const handleQuantityChange = (value: number, item: CartItem): void => {
  item.quantity = value
}

/**
 * 处理左滑删除
 */
const handleSwipeClick = (index: number, item: CartItem): void => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这件商品吗？',
    success: res => {
      if (res.confirm) {
        cartItems.value.splice(index, 1)
        uToast('删除成功', {
          icon: 'success',
        })
      }
    },
  })
}

/**
 * 处理结算或删除
 */
const handleCheckout = (): void => {
  if (selectedCount.value === 0) {
    uToast('请选择商品')
    return
  }

  if (isEditMode.value) {
    // 删除选中商品
    uni.showModal({
      title: '确认删除',
      content: `确定要删除选中的${selectedCount.value}件商品吗？`,
      success: res => {
        if (res.confirm) {
          cartItems.value = cartItems.value.filter(item => !item.selected)
          uToast('删除成功', {
            icon: 'success',
          })
          isEditMode.value = false
        }
      },
    })
  } else {
    // 去结算
    const selectedItems = cartItems.value.filter(item => item.selected)
    console.log('去结算:', selectedItems)

    uni.showToast({
      title: `结算${selectedCount.value}件商品`,
      icon: 'success',
    })

    // 这里可以跳转到结算页面
    // uni.navigateTo({
    //   url: '/pages/checkout/index'
    // })
  }
}

/**
 * 去购物
 */
const goShopping = (): void => {
  uni.switchTab({
    url: '/pages/index/index',
  })
}

onMounted(() => {
  loadCartData()
})
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 80rpx;
  padding-bottom: 130rpx;
}

.edit-btn {
  color: $shop-text-color;
  font-size: 28rpx;
}

.cart-content {
  padding: 20rpx;
}

// 空购物车样式
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  background: #fff;
  border-radius: 16rpx;

  .empty-text {
    font-size: 32rpx;
    color: #333;
    margin: 40rpx 0 16rpx;
  }

  .empty-desc {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 60rpx;
  }
}

// 购物车列表样式
.cart-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.select-all {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .total-count {
    font-size: 28rpx;
    color: #666;
  }
}

.item-list {
  .cart-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .item-select {
    margin-right: 20rpx;
  }

  .item-image {
    margin-right: 20rpx;
  }

  .item-info {
    flex: 1;

    .item-name {
      font-size: 28rpx;
      color: #333;
      line-height: 1.4;
      margin-bottom: 8rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .item-spec {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
    }

    .item-tag {
      margin-bottom: 16rpx;
    }

    .item-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .item-price {
      display: flex;
      align-items: baseline;
      gap: 8rpx;

      .price-symbol {
        font-size: 24rpx;
        color: $shop-text-color;
        font-weight: 500;
      }

      .price-value {
        font-size: 32rpx;
        color: $shop-text-color;
        font-weight: 600;
      }

      .original-price {
        font-size: 24rpx;
        color: #999;
        text-decoration: line-through;
      }
    }
  }
}

// 推荐商品样式
.section-title {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32rpx 0 20rpx;

  .title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-left: 12rpx;
  }
}
.recommend-section {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;

}

// 底部结算栏样式
.cart-footer {
  position: fixed;
  bottom: 88rpx;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  z-index: 100;

  .footer-left {
    margin-right: 20rpx;
  }

  .footer-center {
    flex: 1;

    .total-info {
      display: flex;
      align-items: baseline;

      .total-label {
        font-size: 28rpx;
        color: #333;
        margin-right: 8rpx;
      }

      .total-price {
        display: flex;
        align-items: baseline;

        .price-symbol {
          font-size: 24rpx;
          color: $shop-text-color;
          font-weight: 500;
        }

        .price-value {
          font-size: 36rpx;
          color: $shop-text-color;
          font-weight: 600;
        }
      }
    }

    .saved-amount {
      font-size: 24rpx;
      color: $shop-text-color;
      margin-top: 4rpx;
    }
  }

  .footer-right {
    margin-left: 20rpx;
  }
}
</style>
