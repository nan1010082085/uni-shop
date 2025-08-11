<template>
  <NavBar title="设置" />
  <view class="setting-container" :style="{ paddingTop: pageTop.top + 'px' }">
    <view class="setting-wrap">
      <!-- 隐私设置 -->
      <view class="privacy-section">
        <view class="section-title">隐私设置</view>

        <view class="privacy-item">
          <view class="privacy-info">
            <text class="privacy-label">允许陌生人查看我的资料</text>
            <text class="privacy-desc">关闭后，只有好友可以查看您的个人资料</text>
          </view>
          <u-switch
            v-model="privacySettings.allowStrangerView"
            active-color="#1890ff"
            inactive-color="#cccccc"
          ></u-switch>
        </view>

        <view class="privacy-item">
          <view class="privacy-info">
            <text class="privacy-label">显示我的在线状态</text>
            <text class="privacy-desc">开启后，好友可以看到您的在线状态</text>
          </view>
          <u-switch
            v-model="privacySettings.showOnlineStatus"
            active-color="#1890ff"
            inactive-color="#cccccc"
          ></u-switch>
        </view>
      </view>

      <!-- 通知设置 -->
      <view class="notification-section">
        <view class="section-title">通知设置</view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">新消息通知</text>
            <text class="setting-desc">接收新消息推送通知</text>
          </view>
          <u-switch
            v-model="notificationSettings.newMessage"
            active-color="#1890ff"
            inactive-color="#cccccc"
          ></u-switch>
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">订单状态通知</text>
            <text class="setting-desc">接收订单状态变更通知</text>
          </view>
          <u-switch
            v-model="notificationSettings.orderStatus"
            active-color="#1890ff"
            inactive-color="#cccccc"
          ></u-switch>
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">优惠活动通知</text>
            <text class="setting-desc">接收优惠券和活动推送</text>
          </view>
          <u-switch v-model="notificationSettings.promotion" active-color="#1890ff" inactive-color="#cccccc"></u-switch>
        </view>
      </view>

      <!-- 其他设置 -->
      <view class="other-section">
        <view class="section-title">其他设置</view>

        <view class="setting-item" @click="clearCache">
          <view class="setting-info">
            <text class="setting-label">清除缓存</text>
            <text class="setting-desc">清除应用缓存数据</text>
          </view>
          <u-icon name="arrow-right" class="setting-arrow"></u-icon>
        </view>

        <view class="setting-item" @click="checkUpdate">
          <view class="setting-info">
            <text class="setting-label">检查更新</text>
            <text class="setting-desc">检查应用版本更新</text>
          </view>
          <u-icon name="arrow-right" class="setting-arrow"></u-icon>
        </view>

        <view class="setting-item" @click="showAbout">
          <view class="setting-info">
            <text class="setting-label">关于我们</text>
            <text class="setting-desc">查看应用信息</text>
          </view>
          <u-icon name="arrow-right" class="setting-arrow"></u-icon>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-section">
        <u-button type="error" size="large" @click="handleLogout"> 退出登录 </u-button>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import NavBar from '@/components/NavBar/index.vue'
import useSysTopBottom from '@/hooks/useSysTopBottom'
import { reactive } from 'vue'
const pageTop = useSysTopBottom()
// 隐私设置
const privacySettings = reactive({
  allowStrangerView: true,
  showOnlineStatus: true,
})

// 通知设置
const notificationSettings = reactive({
  newMessage: true,
  orderStatus: true,
  promotion: false,
})

// 清除缓存
const clearCache = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？',
    success: res => {
      if (res.confirm) {
        // 清除缓存逻辑
        uni.showToast({
          title: '缓存已清除',
          icon: 'success',
        })
      }
    },
  })
}

// 检查更新
const checkUpdate = () => {
  uni.showToast({
    title: '已是最新版本',
    icon: 'success',
  })
}

// 关于我们
const showAbout = () => {
  uni.navigateTo({
    url: '/pages/about/about',
  })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: res => {
      if (res.confirm) {
        // 清除用户信息
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('token')

        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login',
        })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.setting-container {
  background-color: #f5f5f5;
  padding-top: 88rpx;
  // #ifdef MP-WEIXIN
  padding-top: 110rpx;
  // #endif
}

.setting-wrap {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-left: 10rpx;
}

.privacy-section,
.notification-section,
.other-section {
  margin-bottom: 40rpx;
}

.privacy-item,
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 30rpx 20rpx;
  margin-bottom: 2rpx;
  border-radius: 10rpx;
}

.privacy-info,
.setting-info {
  flex: 1;
}

.privacy-label,
.setting-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.privacy-desc,
.setting-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.setting-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.logout-section {
  margin-top: 40rpx;
  padding: 0 20rpx;
}
</style>
