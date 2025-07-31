<template>
  <view class="order-page">
    <nav-bar title="订单" />

    <!-- 订单状态标签栏 -->
    <view class="order-tabs">
      <u-grid :col="5">
        <u-grid-item v-for="(item, index) in orderTabs" class="tab-item" @click="handleTabChange(index)">
          <text class="tab-text">{{ item?.name || '' }}</text>
          <u-badge
            v-if="item?.count && item.count > 0"
            :value="item.count"
            max="99"
            :offset="[7, -2]"
            :absolute="true"
            bgColor="#ff6b35"
            size="mini"
          />
        </u-grid-item>
      </u-grid>
      <view
        class="tab-line"
        :style="{
          left: tranformX,
        }"
      ></view>
      <!-- <u-tabs
        :list="orderTabs"
        :current="currentTab"
        @change="handleTabChange"
        :scrollable="false"
        lineColor="#ff6b35"
        activeColor="#ff6b35"
        inactiveColor="#666"
        lineWidth="30"
        lineHeight="3"
        :itemStyle="{ padding: '0 20rpx' }"
      >
        <template #default="{ item, index }">
          <view class="tab-item">
            <text class="tab-text">{{ item?.name || '' }}</text>
            <u-badge
              v-if="item?.count && item.count > 0"
              :value="item.count"
              :offset="[5, -5]"
              bgColor="#ff6b35"
              size="mini"
            />
          </view>
        </template>
      </u-tabs> -->
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view v-for="order in filteredOrders" :key="order.id" class="order-item" @click="handleOrderClick(order)">
        <!-- 订单头部 -->
        <view class="order-header">
          <view class="order-info">
            <text class="order-number">订单编号：{{ order.id }}</text>
            <text class="order-status" :style="{ color: order.statusColor }">
              {{ order.statusText }}
            </text>
          </view>
        </view>

        <!-- 商品列表 -->
        <view class="product-list">
          <view v-for="item in order.items" :key="item.id" class="product-item">
            <u-image
              :src="item.image"
              width="160rpx"
              height="160rpx"
              radius="12rpx"
              :showLoading="true"
              :showError="true"
              loadingIcon="photo"
              errorIcon="error-circle"
            />
            <view class="product-info">
              <view class="product-name">{{ item.name }}</view>
              <view class="product-specs">
                <text>颜色：{{ item.color }}</text>
                <text>尺码：{{ item.size }}</text>
              </view>
              <view class="product-bottom">
                <text class="product-price">¥{{ item.price.toFixed(2) }}</text>
                <text class="product-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <view class="order-total">
            <text>共{{ order.totalQuantity }}件商品 合计：</text>
            <text class="total-price">¥{{ order.totalAmount.toFixed(2) }}</text>
          </view>
          <view class="order-actions">
            <u-button
              v-for="action in order.actions"
              :key="action.type"
              :type="action.primary ? 'primary' : 'default'"
              :color="action.primary ? '#ff6b35' : '#f5f5f5'"
              :customStyle="{
                color: action.primary ? '#fff' : '#333',
                fontSize: '20rpx',
                height: '60rpx',
                marginLeft: '20rpx',
              }"
              size="small"
              @click.stop="handleActionClick(action, order)"
            >
              {{ action.text }}
            </u-button>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredOrders.length === 0" class="empty-state">
      <u-empty mode="list" text="暂无订单" textColor="#999" iconColor="#ddd" :iconSize="120" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from '@/router'
import http from '@/api/request'
import NavBar from '@/components/NavBar/index.vue'
import type { OrderData, Order, OrderAction } from '@/types/data.d'
import { uToast } from '@/utils'
import { onLoad } from '@dcloudio/uni-app'

const router = useRouter()
const route = useRoute()
const instance = getCurrentInstance()
// 响应式数据
const orderData = ref<OrderData>({ orderTabs: [], orders: [] })
const currentTab = ref<number>(0)
const loading = ref<boolean>(false)
const orderTabs = computed(() => orderData.value.orderTabs || [])
const tranformX = computed(() => {
  let index = currentTab.value
  return `calc(30rpx + ((100vw - 60rpx) / 5) * ${index})`
})

/**
 * 计算属性：过滤后的订单列表
 */
const filteredOrders = computed(() => {
  const currentTabId = orderData.value.orderTabs[currentTab.value]?.id
  if (!currentTabId || currentTabId === 'all') {
    return orderData.value.orders
  }

  const statusMap: Record<string, string[]> = {
    pending: ['pending'],
    shipped: ['shipped'],
    receiving: ['receiving'],
    evaluate: ['completed'],
  }

  const targetStatuses = statusMap[currentTabId] || []
  return orderData.value.orders.filter(order => targetStatuses.includes(order.status))
})

/**
 * 加载订单数据
 */
const loadOrderData = async (): Promise<void> => {
  try {
    loading.value = true
    const response = await http.get('/static/data/orders.json')
    console.log('response', response)

    orderData.value = response.data

    // 更新标签计数
    updateTabCounts()
  } catch (error) {
    console.error('加载订单数据失败:', error)
    uToast('加载失败', {
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

/**
 * 更新标签计数
 */
const updateTabCounts = (): void => {
  const statusMap: Record<string, string[]> = {
    pending: ['pending'],
    shipped: ['shipped'],
    receiving: ['receiving'],
    evaluate: ['completed'],
  }

  orderData.value.orderTabs.forEach(tab => {
    if (tab.id === 'all') {
      tab.count = orderData.value.orders.length
    } else {
      const targetStatuses = statusMap[tab.id] || []
      tab.count = orderData.value.orders.filter(order => targetStatuses.includes(order.status)).length
    }
  })
}

/**
 * 处理标签切换
 */
const handleTabChange = (index: number): void => {
  currentTab.value = index
}

/**
 * 处理订单点击
 */
const handleOrderClick = (order: Order): void => {
  router.push({
    path: '/pages/order/detail',
    query: { orderId: order.id },
  })
}

/**
 * 处理操作按钮点击
 */
const handleActionClick = async (action: OrderAction, order: Order): Promise<void> => {
  switch (action.type) {
    case 'pay':
      await handlePay(order)
      break
    case 'cancel':
      await handleCancel(order)
      break
    case 'confirm':
      await handleConfirm(order)
      break
    case 'evaluate':
      handleEvaluate(order)
      break
    case 'logistics':
      handleLogistics(order)
      break
    case 'rebuy':
      await handleRebuy(order)
      break
    case 'service':
      handleService(order)
      break
    case 'detail':
      handleOrderClick(order)
      break
    default:
      console.log('未知操作类型:', action.type)
  }
}

/**
 * 处理支付
 */
const handlePay = async (order: Order): Promise<void> => {
  try {
    uni.showLoading({ title: '正在支付...' })
    // 模拟支付请求
    await new Promise(resolve => setTimeout(resolve, 1500))

    uni.hideLoading()
    uToast('支付成功', {
      icon: 'success',
    })

    // 重新加载数据
    await loadOrderData()
  } catch (error) {
    uni.hideLoading()
    uToast('支付失败', {
      icon: 'error',
    })
  }
}

/**
 * 处理取消订单
 */
const handleCancel = async (order: Order): Promise<void> => {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消这个订单吗？',
    success: async res => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '取消中...' })
          // 模拟取消请求
          await new Promise(resolve => setTimeout(resolve, 1000))

          uni.hideLoading()
          uToast('已取消订单', {
            icon: 'success',
          })
          // 重新加载数据
          await loadOrderData()
        } catch (error) {
          uni.hideLoading()
          uToast('取消失败', {
            icon: 'error',
          })
        }
      }
    },
  })
}

/**
 * 处理确认收货
 */
const handleConfirm = async (order: Order): Promise<void> => {
  uni.showModal({
    title: '确认收货',
    content: '确认已收到商品吗？',
    success: async res => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '确认中...' })
          // 模拟确认请求
          await new Promise(resolve => setTimeout(resolve, 1000))

          uni.hideLoading()
          uToast('确认收货成功', {
            icon: 'success',
          })

          // 重新加载数据
          await loadOrderData()
        } catch (error) {
          uni.hideLoading()
          uToast('确认失败', {
            icon: 'error',
          })
        }
      }
    },
  })
}

/**
 * 处理评价
 */
const handleEvaluate = (order: Order): void => {
  router.push({
    path: '/pages/order/evaluate',
    query: { orderId: order.id },
  })
}

/**
 * 处理查看物流
 */
const handleLogistics = (order: Order): void => {
  router.push({
    path: '/pages/order/logistics',
    query: { orderId: order.id },
  })
}

/**
 * 处理再次购买
 */
const handleRebuy = async (order: Order): Promise<void> => {
  try {
    uni.showLoading({ title: '添加到购物车...' })
    // 模拟添加到购物车
    await new Promise(resolve => setTimeout(resolve, 1000))

    uni.hideLoading()
    uToast('已添加到购物车', {
      icon: 'success',
    })
  } catch (error) {
    uni.hideLoading()
    uToast('添加失败', {
      icon: 'error',
    })
  }
}

/**
 * 处理联系客服
 */
const handleService = (order: Order): void => {
  uToast('正在为您转接客服', {
    icon: 'none',
  })
}
const init = () => {
  // 获取URL参数中的状态
  const options = route?.query || {}
  // 根据状态参数设置当前标签
  if (options.status) {
    currentTab.value = Number(options.status)
  }
  loadOrderData()
}
// 生命周期
// #ifdef APP-PLUS
onLoad(init)
// #endif
// #ifdef H5 || MP-WEIXIN
onMounted(init)
// #endif
</script>

<style lang="scss" scoped>
.order-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 90rpx;
}

.order-tabs {
  position: relative;
  background-color: #fff;
  padding: 0 30rpx;
  border-bottom: 1px solid #eee;

  .tab-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;

    .tab-text {
      font-size: 28rpx;
      font-weight: 500;
    }
  }

  .tab-line {
    position: absolute;
    bottom: 0;
    left: 30rpx;
    width: calc((100vw - 60rpx) / 5);
    height: 1rpx;
    background-color: $shop-text-color;
    transition: left 0.3s ease;
  }
}

.order-list {
  padding: 20rpx 32rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.order-header {
  padding: 24rpx 32rpx;
  border-bottom: 1px solid #f5f5f5;

  .order-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .order-number {
      font-size: 26rpx;
      color: #666;
    }

    .order-status {
      font-size: 26rpx;
      font-weight: 500;
    }
  }
}

.product-list {
  padding: 0 32rpx;
}

.product-item {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1px solid #f5f5f5;

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
      color: #333;
      line-height: 1.4;
      margin-bottom: 12rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .product-specs {
      display: flex;
      gap: 24rpx;
      margin-bottom: 12rpx;

      text {
        font-size: 24rpx;
        color: #999;
      }
    }

    .product-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .product-price {
        font-size: 28rpx;
        color: $shop-text-color;
        font-weight: 600;
      }

      .product-quantity {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.order-footer {
  padding: 24rpx 28rpx;
  background-color: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .order-total {
    font-size: 24rpx;
    color: #666;

    .total-price {
      color: $shop-text-color;
      font-weight: 600;
      font-size: 26rpx;
    }
  }

  .order-actions {
    display: flex;
    align-items: center;
  }
}

.empty-state {
  padding: 120rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
