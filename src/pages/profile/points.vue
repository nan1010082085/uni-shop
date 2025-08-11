<template>
  <nav-bar title="我的积分" />
  <view class="points-container" :style="{ paddingTop: pageTop.top + 'px' }">
    <!-- 积分总览 -->
    <view class="points-header">
      <view class="points-total">
        <text class="points-label">我的积分</text>
        <text class="points-value">{{ totalPoints }}</text>
        <text class="points-desc">100积分 = 1元</text>
      </view>
      <view class="points-actions">
        <view class="action-item" @click="showPointsRules">
          <u-icon name="question-circle" color="#ffffff" size="16"></u-icon>
          <text class="action-text">积分规则</text>
        </view>
      </view>
    </view>

    <!-- 标签页 -->
    <view class="tabs-container">
      <u-tabs
        :list="tabList"
        :current="currentTab"
        @change="handleTabChange"
        line-color="#ff6b6b"
        active-color="#ff6b6b"
        inactive-color="#666666"
      ></u-tabs>
    </view>

    <!-- 积分明细列表 -->
    <view class="points-list">
      <view class="points-item" v-for="item in filteredPointsHistory" :key="item.id">
        <view class="item-left">
          <view class="item-icon" :class="item.type">
            <u-icon :name="getIconName(item.type)" color="#ffffff" size="16"></u-icon>
          </view>
          <view class="item-info">
            <text class="item-title">{{ item.source }}</text>
            <text class="item-desc">{{ item.description }}</text>
            <text class="item-time">{{ formatTime(item.time) }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="points-change" :class="item.type"> {{ item.type === 'earn' ? '+' : '' }}{{ item.points }} </text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredPointsHistory.length === 0">
      <u-icon name="file-text" color="#cccccc" size="60"></u-icon>
      <text class="empty-text">暂无积分记录</text>
    </view>

    <!-- 积分规则弹窗 -->
    <u-popup v-model="showRulesPopup" mode="bottom" border-radius="20" :safe-area-inset-bottom="true">
      <view class="rules-popup">
        <view class="popup-header">
          <text class="popup-title">积分规则</text>
          <u-icon name="close" color="#666666" size="20" @click="showRulesPopup = false"></u-icon>
        </view>
        <view class="rules-content">
          <view class="rule-item" v-for="rule in pointsRules" :key="rule.title">
            <view class="rule-icon">
              <u-icon :name="rule.icon" color="#ff6b6b" size="20"></u-icon>
            </view>
            <view class="rule-info">
              <text class="rule-title">{{ rule.title }}</text>
              <text class="rule-desc">{{ rule.description }}</text>
            </view>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import pointsData from '@/static/data/points.json'
import useSysTopBottom from '@/hooks/useSysTopBottom'

/**
 * 积分数据接口
 */
interface PointsHistory {
  id: number
  type: 'earn' | 'spend'
  source: string
  points: number
  description: string
  time: string
  orderId?: string | null
}

interface PointsRule {
  title: string
  description: string
  icon: string
}

const pageTop = useSysTopBottom()

/**
 * 总积分
 */
const totalPoints = ref<number>(0)

/**
 * 积分历史记录
 */
const pointsHistory = ref<PointsHistory[]>([])

/**
 * 积分规则
 */
const pointsRules = ref<PointsRule[]>([])

/**
 * 当前标签页
 */
const currentTab = ref<number>(0)

/**
 * 标签页列表
 */
const tabList = ref([{ name: '全部' }, { name: '获得' }, { name: '消费' }])

/**
 * 显示规则弹窗
 */
const showRulesPopup = ref<boolean>(false)

/**
 * 过滤后的积分历史
 */
const filteredPointsHistory = computed(() => {
  if (currentTab.value === 0) {
    return pointsHistory.value
  } else if (currentTab.value === 1) {
    return pointsHistory.value.filter(item => item.type === 'earn')
  } else {
    return pointsHistory.value.filter(item => item.type === 'spend')
  }
})

/**
 * 加载积分数据
 */
const loadPointsData = () => {
  totalPoints.value = pointsData.totalPoints
  pointsHistory.value = pointsData.pointsHistory as PointsHistory[]
  pointsRules.value = pointsData.pointsRules
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
 * 获取图标名称
 * @param type 积分类型
 */
const getIconName = (type: string): string => {
  return type === 'earn' ? 'plus' : 'minus'
}

/**
 * 处理标签页切换
 * @param index 标签页索引
 */
const handleTabChange = (index: number) => {
  currentTab.value = index
}

/**
 * 显示积分规则
 */
const showPointsRules = () => {
  showRulesPopup.value = true
}

/**
 * 页面加载时获取数据
 */
onMounted(() => {
  loadPointsData()
})
</script>

<style lang="scss" scoped>
.points-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 88rpx;
  // #ifdef MP-WEIXIN
  padding-top: 110rpx;
  // #endif
}

.points-header {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  padding: 60rpx 40rpx 40rpx;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.points-total {
  flex: 1;
}

.points-label {
  font-size: 28rpx;
  opacity: 0.9;
  display: block;
  margin-bottom: 16rpx;
}

.points-value {
  font-size: 72rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}

.points-desc {
  font-size: 24rpx;
  opacity: 0.8;
}

.points-actions {
  display: flex;
  align-items: center;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
}

.action-text {
  font-size: 24rpx;
  margin-left: 8rpx;
}

.tabs-container {
  background-color: #ffffff;
  padding: 0 40rpx;
}

.points-list {
  padding: 20rpx 0;
}

.points-item {
  background-color: #ffffff;
  padding: 30rpx 40rpx;
  margin-bottom: 2rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.item-icon.earn {
  background-color: #52c41a;
}

.item-icon.spend {
  background-color: #ff6b6b;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
}

.item-desc {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.item-time {
  font-size: 22rpx;
  color: #cccccc;
}

.item-right {
  text-align: right;
}

.points-change {
  font-size: 32rpx;
  font-weight: 600;
}

.points-change.earn {
  color: #52c41a;
}

.points-change.spend {
  color: #ff6b6b;
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
  font-size: 28rpx;
  color: #999999;
  margin-top: 32rpx;
}

.rules-popup {
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

.rules-content {
  padding: 40rpx;
  max-height: 50vh;
  overflow-y: auto;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 40rpx;
}

.rule-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: #fff2f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.rule-info {
  flex: 1;
}

.rule-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12rpx;
  display: block;
}

.rule-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.4;
}
</style>
