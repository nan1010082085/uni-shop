<template>
  <nav-bar title="我的消息" />
  <view class="news-container" :style="{ paddingTop: pageTop.top + 'px' }">
    <!-- 消息统计 -->
    <view class="message-stats" v-if="unreadCount > 0">
      <text class="stats-text">您有 {{ unreadCount }} 条未读消息</text>
      <view class="mark-all-read" @click="markAllAsRead">
        <text class="mark-text">全部已读</text>
      </view>
    </view>

    <!-- 消息列表 -->
    <view class="message-list" v-if="messageList.length > 0">
      <view class="message-item" v-for="item in messageList" :key="item.id">
        <u-swipe-action>
          <u-swipe-action-item :options="swipeOptions" @click="handleSwipeClick($event, item)">
            <view class="message-content" @click="handleMessageClick(item)">
              <view class="message-icon" :class="item.type">
                <u-icon :name="getMessageIcon(item.type)" color="#ffffff" size="16"></u-icon>
              </view>

              <view class="message-info">
                <view class="message-header">
                  <text class="message-title">{{ item.title }}</text>
                  <view class="unread-dot" v-if="!item.isRead"></view>
                </view>
                <text class="message-summary">{{ item.summary }}</text>
                <text class="message-time">{{ formatTime(item.time) }}</text>
              </view>

              <view class="message-arrow">
                <u-icon name="arrow-right" color="#cccccc" size="14"></u-icon>
              </view>
            </view>
          </u-swipe-action-item>
        </u-swipe-action>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <u-icon name="bell" color="#cccccc" size="80"></u-icon>
      <text class="empty-text">暂无消息</text>
      <text class="empty-desc">有新消息时会在这里显示</text>
    </view>

    <!-- 消息详情弹窗 -->
    <u-popup v-model="showDetailPopup" mode="bottom" border-radius="20" :safe-area-inset-bottom="true">
      <view class="detail-popup">
        <view class="popup-header">
          <text class="popup-title">消息详情</text>
          <u-icon name="close" color="#666666" size="20" @click="showDetailPopup = false"></u-icon>
        </view>

        <view class="detail-content" v-if="selectedMessage">
          <view class="detail-header">
            <text class="detail-title">{{ selectedMessage.title }}</text>
            <text class="detail-time">{{ formatTime(selectedMessage.time) }}</text>
          </view>
          <view class="detail-body">
            <text class="detail-text">{{ selectedMessage.content }}</text>
          </view>

          <!-- 相关操作按钮 -->
          <view class="detail-actions" v-if="selectedMessage.type === 'order' || selectedMessage.type === 'coupon'">
            <u-button type="primary" size="normal" @click="handleRelatedAction">
              {{ getActionButtonText(selectedMessage.type) }}
            </u-button>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import newsData from '@/static/data/news.json'
import useSysTopBottom from '@/hooks/useSysTopBottom'

/**
 * 消息数据接口
 */
interface Message {
  id: number
  title: string
  summary: string
  content: string
  type: 'order' | 'coupon' | 'points' | 'product' | 'system'
  isRead: boolean
  time: string
  orderId?: string
  couponId?: string
  productId?: number
  points?: number
}

const pageTop = useSysTopBottom()
/**
 * 消息列表
 */
const messageList = ref<Message[]>([])

/**
 * 选中的消息
 */
const selectedMessage = ref<Message | null>(null)

/**
 * 显示详情弹窗
 */
const showDetailPopup = ref<boolean>(false)

/**
 * 滑动操作选项
 */
const swipeOptions = ref([
  {
    text: '删除',
    style: {
      backgroundColor: '#ff6b6b',
    },
  },
])

/**
 * 未读消息数量
 */
const unreadCount = computed(() => {
  return messageList.value.filter(item => !item.isRead).length
})

/**
 * 加载消息数据
 */
const loadMessageData = () => {
  messageList.value = newsData.messageList as Message[]
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
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * 获取消息图标
 * @param type 消息类型
 */
const getMessageIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    order: 'shopping-cart',
    coupon: 'gift',
    points: 'star',
    product: 'tag',
    system: 'info-circle',
  }
  return iconMap[type] || 'bell'
}

/**
 * 获取操作按钮文本
 * @param type 消息类型
 */
const getActionButtonText = (type: string): string => {
  const textMap: Record<string, string> = {
    order: '查看订单',
    coupon: '查看优惠券',
    points: '查看积分',
    product: '查看商品',
  }
  return textMap[type] || '查看详情'
}

/**
 * 处理消息点击
 * @param message 消息信息
 */
const handleMessageClick = (message: Message) => {
  // 标记为已读
  if (!message.isRead) {
    message.isRead = true
  }

  selectedMessage.value = message
  showDetailPopup.value = true
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
 * @param message 消息信息
 */
const handleSwipeClick = (event: SwipeEvent, message: Message) => {
  if (event.index === 0) {
    handleDeleteMessage(message)
  }
}

/**
 * 删除消息
 * @param message 消息信息
 */
const handleDeleteMessage = (message: Message) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这条消息吗？',
    success: res => {
      if (res.confirm) {
        const index = messageList.value.findIndex(item => item.id === message.id)
        if (index > -1) {
          messageList.value.splice(index, 1)
          uni.showToast({
            title: '消息已删除',
            icon: 'success',
          })
        }
      }
    },
  })
}

/**
 * 全部标记为已读
 */
const markAllAsRead = () => {
  messageList.value.forEach(item => {
    item.isRead = true
  })

  uni.showToast({
    title: '已全部标记为已读',
    icon: 'success',
  })
}

/**
 * 处理相关操作
 */
const handleRelatedAction = () => {
  if (!selectedMessage.value) return

  const message = selectedMessage.value
  showDetailPopup.value = false

  switch (message.type) {
    case 'order':
      if (message.orderId) {
        uni.navigateTo({
          url: `/pages/order/detail?id=${message.orderId}`,
        })
      }
      break
    case 'coupon':
      uni.navigateTo({
        url: '/pages/profile/coupon',
      })
      break
    case 'points':
      uni.navigateTo({
        url: '/pages/profile/points',
      })
      break
    case 'product':
      if (message.productId) {
        uni.navigateTo({
          url: `/pages/product/detail?id=${message.productId}`,
        })
      }
      break
    default:
      break
  }
}

/**
 * 页面加载时获取数据
 */
onMounted(() => {
  loadMessageData()
})
</script>

<style lang="scss" scoped>
.news-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 88rpx;
  // #ifdef MP-WEIXIN
  padding-top: 110rpx;
  // #endif
}

.message-stats {
  background-color: #fff2f0;
  padding: 24rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.stats-text {
  font-size: 26rpx;
  color: #ff6b6b;
}

.mark-all-read {
  padding: 8rpx 24rpx;
  background-color: #ff6b6b;
  border-radius: 24rpx;
  display: flex;
}

.mark-text {
  font-size: 22rpx;
  color: #ffffff;
}

.message-list {
  padding: 20rpx 0;
}

.message-item {
  margin-bottom: 2rpx;
}

.message-content {
  background-color: #ffffff;
  padding: 30rpx 40rpx;
  display: flex;
  align-items: center;
}

.message-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.message-icon.order {
  background-color: #52c41a;
}

.message-icon.coupon {
  background-color: #ff6b6b;
}

.message-icon.points {
  background-color: #faad14;
}

.message-icon.product {
  background-color: #1890ff;
}

.message-icon.system {
  background-color: #722ed1;
}

.message-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.message-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-right: 16rpx;
}

.unread-dot {
  width: 16rpx;
  height: 16rpx;
  background-color: #ff6b6b;
  border-radius: 8rpx;
}

.message-summary {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
  line-height: 1.3;
}

.message-time {
  font-size: 22rpx;
  color: #cccccc;
}

.message-arrow {
  margin-left: 24rpx;
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

.detail-popup {
  background-color: #ffffff;
  max-height: 70vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 40rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.detail-content {
  padding: 40rpx;
  max-height: 50vh;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 40rpx;
}

.detail-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
  display: block;
}

.detail-time {
  font-size: 24rpx;
  color: #999999;
}

.detail-body {
  margin-bottom: 40rpx;
}

.detail-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

.detail-actions {
  padding-top: 40rpx;
  border-top: 1px solid #f0f0f0;
}
</style>
