<template>
  <nav-bar title="优惠券" />
  <view class="coupon-container" :style="{ paddingTop: pageTop.top + 'px' }">
    <!-- 标签页 -->
    <view class="tabs-container">
      <view class="tab-item" :class="{ active: activeTab === 'unused' }" @click="switchTab('unused')">
        <text class="tab-text">未使用</text>
        <text class="tab-count" v-if="couponData.unused.length > 0">({{ couponData.unused.length }})</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'used' }" @click="switchTab('used')">
        <text class="tab-text">已使用</text>
        <text class="tab-count" v-if="couponData.used.length > 0">({{ couponData.used.length }})</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'expired' }" @click="switchTab('expired')">
        <text class="tab-text">已过期</text>
        <text class="tab-count" v-if="couponData.expired.length > 0">({{ couponData.expired.length }})</text>
      </view>
    </view>

    <!-- 优惠券列表 -->
    <scroll-view scroll-y class="coupon-list">
      <view v-if="currentCoupons.length > 0" class="coupon-content">
        <view
          v-for="coupon in currentCoupons"
          :key="coupon.id"
          class="coupon-card"
          :class="getCardClass(coupon.status)"
          @click="handleCouponClick(coupon)"
        >
          <!-- 优惠券左侧 -->
          <view class="coupon-left">
            <view class="coupon-value">
              <text class="value-symbol">¥</text>
              <text class="value-amount">{{ coupon.value }}</text>
            </view>
            <text class="coupon-type">{{ getCouponTypeText(coupon.type) }}</text>
          </view>

          <!-- 优惠券中间分割线 -->
          <view class="coupon-divider">
            <view class="divider-circle top"></view>
            <view class="divider-line"></view>
            <view class="divider-circle bottom"></view>
          </view>

          <!-- 优惠券右侧 -->
          <view class="coupon-right">
            <view class="coupon-info">
              <text class="coupon-name">{{ coupon.name }}</text>
              <text class="coupon-desc">{{ coupon.description }}</text>
              <text class="coupon-scope">适用范围：{{ coupon.scope }}</text>
              <text class="coupon-validity"
                >有效期：{{ formatDate(coupon.validFrom) }} - {{ formatDate(coupon.validTo) }}</text
              >

              <!-- 已使用状态显示使用时间 -->
              <text v-if="coupon.status === 'used' && coupon.useTime" class="use-time">
                使用时间：{{ formatDateTime(coupon.useTime) }}
              </text>
            </view>

            <!-- 状态标签 -->
            <view class="coupon-status">
              <view class="status-tag" :class="getStatusClass(coupon.status)">
                <text class="status-text">{{ getStatusText(coupon.status) }}</text>
              </view>
            </view>
          </view>

          <!-- 优惠券操作按钮 -->
          <view v-if="coupon.status === 'unused'" class="coupon-action">
            <u-button type="primary" size="small" @click.stop="useCoupon(coupon)"> 立即使用 </u-button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <u-icon name="coupon" color="#cccccc" size="60"></u-icon>
        <text class="empty-text">{{ getEmptyText() }}</text>
        <u-button v-if="activeTab !== 'unused'" type="primary" size="small" @click="switchTab('unused')">
          查看可用优惠券
        </u-button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar/index.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import couponJsonData from '@/static/data/coupon.json'
import useSysTopBottom from '@/hooks/useSysTopBottom'

/**
 * 优惠券接口
 */
interface Coupon {
  id: number
  name: string
  type: 'discount' | 'shipping'
  value: number
  minAmount: number
  description: string
  validFrom: string
  validTo: string
  status: 'unused' | 'used' | 'expired'
  scope: string
  getTime: string
  useTime?: string
  orderId?: string
}

/**
 * 优惠券数据接口
 */
interface CouponData {
  unused: Coupon[]
  used: Coupon[]
  expired: Coupon[]
}

const pageTop = useSysTopBottom()

/**
 * 当前激活的标签
 */
const activeTab = ref<'unused' | 'used' | 'expired'>('unused')

/**
 * 优惠券数据
 */
const couponData = reactive<CouponData>({
  unused: [],
  used: [],
  expired: [],
})

/**
 * 当前显示的优惠券列表
 */
const currentCoupons = computed(() => {
  return couponData[activeTab.value] || []
})

/**
 * 加载优惠券数据
 */
const loadCouponData = () => {
  // 从JSON文件加载数据
  Object.assign(couponData, couponJsonData as CouponData)
}

/**
 * 切换标签
 * @param tab 标签类型
 */
const switchTab = (tab: 'unused' | 'used' | 'expired') => {
  activeTab.value = tab
}

/**
 * 获取优惠券卡片样式类
 * @param status 优惠券状态
 */
const getCardClass = (status: string) => {
  return {
    'card-unused': status === 'unused',
    'card-used': status === 'used',
    'card-expired': status === 'expired',
  }
}

/**
 * 获取状态样式类
 * @param status 优惠券状态
 */
const getStatusClass = (status: string) => {
  return {
    'status-unused': status === 'unused',
    'status-used': status === 'used',
    'status-expired': status === 'expired',
  }
}

/**
 * 获取优惠券类型文本
 * @param type 优惠券类型
 */
const getCouponTypeText = (type: string) => {
  const typeMap = {
    discount: '优惠券',
    shipping: '运费券',
  }
  return typeMap[type as keyof typeof typeMap] || '优惠券'
}

/**
 * 获取状态文本
 * @param status 优惠券状态
 */
const getStatusText = (status: string) => {
  const statusMap = {
    unused: '未使用',
    used: '已使用',
    expired: '已过期',
  }
  return statusMap[status as keyof typeof statusMap] || '未知'
}

/**
 * 获取空状态文本
 */
const getEmptyText = () => {
  const textMap = {
    unused: '暂无可用优惠券',
    used: '暂无已使用优惠券',
    expired: '暂无过期优惠券',
  }
  return textMap[activeTab.value]
}

/**
 * 格式化日期
 * @param dateString 日期字符串
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}.${date.getDate()}`
}

/**
 * 格式化日期时间
 * @param dateString 日期字符串
 */
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0',
  )} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * 处理优惠券点击
 * @param coupon 优惠券信息
 */
const handleCouponClick = (coupon: Coupon) => {
  if (coupon.status === 'used' && coupon.orderId) {
    uni.showModal({
      title: '优惠券详情',
      content: `该优惠券已在订单 ${coupon.orderId} 中使用`,
      showCancel: false,
    })
  }
}

/**
 * 使用优惠券
 * @param coupon 优惠券信息
 */
const useCoupon = (coupon: Coupon) => {
  uni.showModal({
    title: '使用优惠券',
    content: `确定要使用这张优惠券吗？`,
    success: res => {
      if (res.confirm) {
        // 模拟使用优惠券
        const index = couponData.unused.findIndex(item => item.id === coupon.id)
        if (index !== -1) {
          const usedCoupon = { ...coupon }
          usedCoupon.status = 'used' as const
          usedCoupon.useTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
          usedCoupon.orderId = `ORD${Date.now()}`

          couponData.unused.splice(index, 1)
          couponData.used.unshift(usedCoupon)

          uni.showToast({
            title: '优惠券使用成功',
            icon: 'success',
          })
        }
      }
    },
  })
}

/**
 * 页面加载时获取数据
 */
onMounted(() => {
  // 直接使用导入的数据
  loadCouponData()
})
</script>

<style lang="scss" scoped>
.coupon-container {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  padding-top: 88rpx;
  // #ifdef MP-WEIXIN
  padding-top: 110rpx;
  // #endif
}

.tabs-container {
  background-color: #ffffff;
  display: flex;
  border-bottom: 2rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  padding: 32rpx 0;
  text-align: center;
  position: relative;
}

.tab-item.active {
  color: #1890ff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #1890ff;
}

.tab-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.tab-item.active .tab-text {
  color: #1890ff;
}

.tab-count {
  font-size: 24rpx;
  color: #999999;
  margin-left: 8rpx;
}

.tab-item.active .tab-count {
  color: #1890ff;
}

.coupon-list {
  flex: 1;
  padding: 32rpx;
}

.coupon-content {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.coupon-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  display: flex;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.card-unused {
  border-left: 16rpx solid #52c41a;
}

.card-used {
  border-left: 16rpx solid #d9d9d9;
  opacity: 0.7;
}

.card-expired {
  border-left: 16rpx solid #ff4d4f;
  opacity: 0.6;
}

.coupon-left {
  width: 200rpx;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
  color: #ffffff;
}

.card-unused .coupon-left {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.card-used .coupon-left {
  background: linear-gradient(135deg, #d9d9d9 0%, #f0f0f0 100%);
  color: #999999;
}

.card-expired .coupon-left {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.coupon-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 8rpx;
}

.value-symbol {
  font-size: 28rpx;
  font-weight: 500;
}

.value-amount {
  font-size: 56rpx;
  font-weight: 700;
  margin-left: 4rpx;
}

.coupon-type {
  font-size: 24rpx;
  opacity: 0.9;
}

.coupon-divider {
  width: 2rpx;
  position: relative;
  background-color: #f0f0f0;
}

.divider-circle {
  position: absolute;
  width: 24rpx;
  height: 24rpx;
  background-color: #f5f5f5;
  border-radius: 50%;
  left: -12rpx;
}

.divider-circle.top {
  top: -12rpx;
}

.divider-circle.bottom {
  bottom: -12rpx;
}

.divider-line {
  width: 2rpx;
  height: 100%;
  background: repeating-linear-gradient(to bottom, #f0f0f0 0rpx, #f0f0f0 8rpx, transparent 8rpx, transparent 16rpx);
}

.coupon-right {
  flex: 1;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
  display: block;
}

.coupon-desc {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 12rpx;
  display: block;
}

.coupon-scope {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
  display: block;
}

.coupon-validity {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
  display: block;
}

.use-time {
  font-size: 24rpx;
  color: #52c41a;
  display: block;
}

.coupon-status {
  display: flex;
  justify-content: flex-end;
  margin-top: 16rpx;
  margin-right: 16rpx;
}

.status-tag {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.status-unused {
  background-color: #f6ffed;
  color: #52c41a;
  border: 2rpx solid #b7eb8f;
}

.status-used {
  background-color: #f5f5f5;
  color: #999999;
  border: 2rpx solid #d9d9d9;
}

.status-expired {
  background-color: #fff2f0;
  color: #ff4d4f;
  border: 2rpx solid #ffccc7;
}

.status-text {
  font-size: 24rpx;
  font-weight: 500;
}

.coupon-action {
  position: absolute;
  bottom: 32rpx;
  right: 44rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-text {
  font-size: 32rpx;
  color: #999999;
  margin: 40rpx 0;
}
</style>
