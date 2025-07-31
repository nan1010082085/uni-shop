<template>
  <view class="my-page">
    <!-- 用户信息区域 -->
    <view class="user-section">
      <view class="user-info">
        <u-avatar :src="userData.userInfo.avatar" size="80" shape="circle" />
        <view class="user-details">
          <view class="user-name">{{ userData.userInfo.name }}</view>
          <view class="user-level">{{ userData.userInfo.level }}</view>
        </view>
        <view class="edit-btn" @click="handleEditProfile">
          <text>编辑资料</text>
          <u-icon name="arrow-right" size="14" color="#ff6b35" />
        </view>
      </view>

      <!-- 快捷菜单 -->
      <view class="quick-menu">
        <view class="menu-item" v-for="item in userData.menuItems" :key="item.id" @click="handleMenuClick(item.path)">
          <view class="menu-icon" :style="{ backgroundColor: item.color }">
            <u-icon :name="item.icon" color="white" size="20" />
          </view>
          <text class="menu-text">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 我的订单 -->
    <view class="order-section">
      <view class="section-header">
        <text class="section-title">我的订单</text>
        <view class="view-all" @click="handleViewAllOrders">
          <text>查看全部</text>
          <u-icon name="arrow-right" size="14" color="#ff6b35" />
        </view>
      </view>

      <view class="order-status">
        <view
          class="status-item"
          v-for="item in userData.orderStatus"
          :key="item.id"
          @click="handleOrderClick(item.path, item.status || 0)"
        >
          <view class="status-icon">
            <u-icon :name="item.icon" size="24" color="#666" />
            <u-badge v-if="item.count > 0" :count="item.count" :offset="[5, 5]" />
          </view>
          <text class="status-text">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 服务功能 -->
    <view class="service-section">
      <view class="service-row">
        <view
          class="service-item"
          v-for="item in userData.serviceItems.slice(0, 2)"
          :key="item.id"
          @click="handleServiceClick(item.path)"
        >
          <u-icon :name="item.icon" :color="item.color" size="20" />
          <text class="service-text">{{ item.name }}</text>
          <u-icon name="arrow-right" size="14" color="#ccc" />
        </view>
      </view>

      <view class="service-row">
        <view
          class="service-item"
          v-for="item in userData.serviceItems.slice(2, 4)"
          :key="item.id"
          @click="handleServiceClick(item.path)"
        >
          <u-icon :name="item.icon" :color="item.color" size="20" />
          <text class="service-text">{{ item.name }}</text>
          <u-icon name="arrow-right" size="14" color="#ccc" />
        </view>
      </view>
    </view>

    <!-- 发现好物 -->
    <view class="section-header">
      <text class="section-title">发现好物</text>
    </view>
    <view class="discover-section">
      <RecommendList :products="discoverList" />
    </view>
  </view>

  <tab-bar :active="3" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from '@/router'
import TabBar from '@/components/TabBar/index.vue'
import RecommendList from '@/components/RecommendList/index.vue'
import http from '@/api/request'
import type { UserData, DiscoverProduct } from '@/types/data'
import userData from '@/static/data/user.json'

const router = useRouter()
const route = useRoute()
const discoverList = ref<DiscoverProduct[]>([])

/**
 * 页面初始化
 */
onMounted(() => {
  loadUserData()
  loadDiscoverProducts()
})

/**
 * 加载用户数据
 */
const loadUserData = async () => {
  try {
    // 这里可以通过API请求获取用户数据
    // const response = await request.get('/api/user/profile')
    console.log('用户数据加载完成', userData)
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}

/**
 * 加载发现好物数据
 */
const loadDiscoverProducts = async () => {
  try {
    // 这里可以通过API请求获取发现好物数据
    // const response = await http.get('/api/discover/products')
    discoverList.value = userData.discoverProducts
  } catch (error) {
    console.error('加载发现好物数据失败:', error)
  }
}

/**
 * 处理编辑资料点击
 */
const handleEditProfile = () => {
  router.push('/pages/profile/edit')
}

/**
 * 处理快捷菜单点击
 * @param path - 跳转路径
 */
const handleMenuClick = (path: string) => {
  router.push(path)
}

/**
 * 处理查看全部订单
 */
const handleViewAllOrders = () => {
  router.push({
    path: '/pages/order/index',
    query: {
      redirect: route.path,
      status: 0,
    },
  })
}

/**
 * 处理订单状态点击
 * @param path - 跳转路径
 */
const handleOrderClick = (path: string, status: number) => {
  router.push({
    path: path,
    query: {
      redirect: route.path,
      status,
    },
  })
}

/**
 * 处理服务功能点击
 * @param path - 跳转路径
 */
const handleServiceClick = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.my-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 100rpx;
}

.user-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx 30rpx;
  // #ifdef MP-WEIXIN
  padding-top: 160rpx;
  // #endif
  color: white;

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;

    .user-details {
      flex: 1;
      margin-left: 20rpx;

      .user-name {
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .user-level {
        font-size: 24rpx;
        opacity: 0.8;
      }
    }

    .edit-btn {
      display: flex;
      align-items: center;
      padding: 12rpx 20rpx;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 20rpx;
      font-size: 24rpx;

      text {
        margin-right: 8rpx;
      }
    }
  }

  .quick-menu {
    display: flex;
    justify-content: space-between;

    .menu-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .menu-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12rpx;
      }

      .menu-text {
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }
}

.order-section {
  background-color: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx 0;

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    border-bottom: 1px solid $u-border-color;

    .section-title {
      flex-basis: 50%;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .view-all {
      flex-basis: 50%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-size: 24rpx;
      color: $shop-text-color;

      text {
        margin-right: 8rpx;
      }
    }
  }

  .order-status {
    display: flex;
    padding: 0 30rpx;
    justify-content: space-between;

    .status-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;

      .status-icon {
        position: relative;
        margin-bottom: 12rpx;
      }

      .status-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.service-section {
  background-color: white;
  margin: 0 20rpx 20rpx;
  border-radius: 16rpx;
  padding: 20rpx 0;

  .service-row {
    display: flex;

    .service-item {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 20rpx 30rpx;

      .service-text {
        flex: 1;
        margin-left: 20rpx;
        font-size: 28rpx;
        color: #333;
      }
    }
  }
}

.section-header {
  padding: 10rpx 30rpx 20rpx;
  border-radius: 16rpx 16rpx 0 0;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

.discover-section {
  margin: 0 20rpx;
}
</style>
