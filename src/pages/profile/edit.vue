<template>
  <nav-bar title="编辑资料" />
  <view class="edit-container">
    <scroll-view scroll-y class="scroll-container">
      <!-- 头像设置 -->
      <view class="avatar-section">
        <text class="section-title">头像</text>
        <view class="avatar-container" @click="handleAvatarClick">
          <image
            class="avatar-image"
            :src="userInfo.avatar || '/static/images/default-avatar.png'"
            mode="aspectFill"
          ></image>
          <view class="avatar-overlay">
            <u-icon name="camera" color="#ffffff" size="20"></u-icon>
          </view>
        </view>
      </view>

      <!-- 基本信息表单 -->
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input class="form-input" v-model="userInfo.nickname" placeholder="请输入昵称" maxlength="20" />
        </view>

        <view class="form-item">
          <text class="form-label">性别</text>
          <view class="gender-selector">
            <view
              class="gender-option"
              :class="{ active: userInfo.gender === 'male' }"
              @click="userInfo.gender = 'male'"
            >
              <u-icon name="man" color="#1890ff" size="16"></u-icon>
              <text class="gender-text">男</text>
            </view>
            <view
              class="gender-option"
              :class="{ active: userInfo.gender === 'female' }"
              @click="userInfo.gender = 'female'"
            >
              <u-icon name="woman" color="#ff6b6b" size="16"></u-icon>
              <text class="gender-text">女</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">生日</text>
          <view class="date-picker" @click="showDatePicker = true">
            <text class="date-text" :class="{ placeholder: !userInfo.birthday }">{{
              userInfo.birthday || '请选择生日'
            }}</text>
            <u-icon name="calendar" color="#cccccc" size="16"></u-icon>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">手机号</text>
          <input class="form-input" v-model="userInfo.phone" placeholder="请输入手机号" type="number" maxlength="11" />
        </view>

        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input class="form-input" v-model="userInfo.email" placeholder="请输入邮箱地址" type="email" />
        </view>

        <view class="form-item">
          <text class="form-label">所在地区</text>
          <view class="region-picker" @click="showRegionPicker = true">
            <text class="region-text" :class="{ placeholder: !userInfo.region }">{{
              userInfo.region || '请选择所在地区'
            }}</text>
            <u-icon name="arrow-right" color="#cccccc" size="16"></u-icon>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">个人简介</text>
          <textarea
            class="form-textarea"
            v-model="userInfo.bio"
            placeholder="请输入个人简介"
            maxlength="200"
            :show-count="true"
          ></textarea>
        </view>
      </view>



      <!-- 保存按钮 -->
      <view class="save-section">
        <u-button type="primary" size="large" :loading="saving" @click="handleSave">
          {{ saving ? '保存中...' : '保存' }}
        </u-button>
      </view>
    </scroll-view>

    <!-- 日期选择器 -->
    <u-datetime-picker
      v-model="showDatePicker"
      mode="date"
      :max-date="maxDate"
      :min-date="minDate"
      @confirm="handleDateConfirm"
      @cancel="showDatePicker = false"
    ></u-datetime-picker>

    <!-- 地区选择器 -->
    <u-picker
      v-model="showRegionPicker"
      mode="region"
      @confirm="handleRegionConfirm"
      @cancel="showRegionPicker = false"
    ></u-picker>

    <!-- 头像选择弹窗 -->
    <u-action-sheet
      v-model="showAvatarSheet"
      :actions="avatarActions"
      @select="handleAvatarSelect"
      cancel-text="取消"
    ></u-action-sheet>
  </view>
</template>
<script setup lang="ts">
import NavBar from '@/components/NavBar/index.vue'
import { useRoute } from '@/router'
import { ref, reactive, onMounted } from 'vue'

const route = useRoute()

/**
 * 用户信息接口
 */
interface UserInfo {
  avatar: string
  nickname: string
  gender: 'male' | 'female' | ''
  birthday: string
  phone: string
  email: string
  region: string
  bio: string
  allowStrangerView: boolean
  showOnlineStatus: boolean
}

/**
 * 用户信息
 */
const userInfo = reactive<UserInfo>({
  avatar: '',
  nickname: '',
  gender: '',
  birthday: '',
  phone: '',
  email: '',
  region: '',
  bio: '',
  allowStrangerView: true,
  showOnlineStatus: true,
})

/**
 * 保存状态
 */
const saving = ref<boolean>(false)

/**
 * 显示日期选择器
 */
const showDatePicker = ref<boolean>(false)

/**
 * 显示地区选择器
 */
const showRegionPicker = ref<boolean>(false)

/**
 * 显示头像选择弹窗
 */
const showAvatarSheet = ref<boolean>(false)

/**
 * 最大日期（今天）
 */
const maxDate = ref<number>(Date.now())

/**
 * 最小日期（100年前）
 */
const minDate = ref<number>(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000)

/**
 * 头像操作选项
 */
const avatarActions = ref([
  {
    name: '拍照',
    value: 'camera',
  },
  {
    name: '从相册选择',
    value: 'album',
  },
])

/**
 * 加载用户信息
 */
const loadUserInfo = () => {
  // 模拟从本地存储或API获取用户信息
  const savedUserInfo = uni.getStorageSync('userInfo')
  if (savedUserInfo) {
    Object.assign(userInfo, savedUserInfo)
  } else {
    // 设置默认值
    userInfo.nickname = '用户' + Math.floor(Math.random() * 10000)
    userInfo.allowStrangerView = true
    userInfo.showOnlineStatus = true
  }
}

/**
 * 处理头像点击
 */
const handleAvatarClick = () => {
  showAvatarSheet.value = true
}

/**
 * 头像选择操作接口
 */
interface AvatarAction {
  name: string
  value: 'camera' | 'album'
}

/**
 * 处理头像选择
 * @param action 选择的操作
 */
const handleAvatarSelect = (action: AvatarAction) => {
  showAvatarSheet.value = false

  const sourceType = action.value === 'camera' ? ['camera'] : ['album']

  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType,
    success: res => {
      const tempFilePath = res.tempFilePaths[0]

      // 这里可以上传到服务器，现在先直接使用本地路径
      userInfo.avatar = tempFilePath

      uni.showToast({
        title: '头像已更新',
        icon: 'success',
      })
    },
    fail: err => {
      console.error('选择图片失败:', err)
      uni.showToast({
        title: '选择图片失败',
        icon: 'none',
      })
    },
  })
}

/**
 * 日期选择事件接口
 */
interface DatePickerEvent {
  value: string | number
}

/**
 * 处理日期确认
 * @param event 日期事件
 */
const handleDateConfirm = (event: DatePickerEvent) => {
  const date = new Date(event.value)
  userInfo.birthday = date.toLocaleDateString('zh-CN')
  showDatePicker.value = false
}

/**
 * 地区选择项接口
 */
interface RegionItem {
  label: string
  value: string
}

/**
 * 地区选择事件接口
 */
interface RegionPickerEvent {
  value: {
    province: RegionItem
    city: RegionItem
    area: RegionItem
  }
}

/**
 * 处理地区确认
 * @param event 地区事件
 */
const handleRegionConfirm = (event: RegionPickerEvent) => {
  const { province, city, area } = event.value
  userInfo.region = `${province.label} ${city.label} ${area.label}`
  showRegionPicker.value = false
}

/**
 * 验证表单
 */
const validateForm = (): boolean => {
  if (!userInfo.nickname.trim()) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none',
    })
    return false
  }

  if (userInfo.phone && !/^1[3-9]\d{9}$/.test(userInfo.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
    })
    return false
  }

  if (userInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
    uni.showToast({
      title: '请输入正确的邮箱地址',
      icon: 'none',
    })
    return false
  }

  return true
}

/**
 * 处理保存
 */
const handleSave = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    // 模拟保存到服务器
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 保存到本地存储
    uni.setStorageSync('userInfo', userInfo)

    uni.showToast({
      title: '保存成功',
      icon: 'success',
    })

    // 延迟返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none',
    })
  } finally {
    saving.value = false
  }
}

const init = () => {
  const id = route.query.id as string
  console.log('user info  id', id)
  loadUserInfo()
}

onMounted(init)
</script>

<style lang="scss" scoped>
.edit-container {
  height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20rpx;
  padding-top: 88rpx;
  // #ifdef MP-WEIXIN
  padding-top: 177rpx;
  // #endif
}

.scroll-container {
  height: 100%;
}

.avatar-section {
  background-color: #ffffff;
  padding: 60rpx 40rpx;
  text-align: center;
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 40rpx;
  display: block;
}

.avatar-container {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 80rpx;
  border: 6rpx solid #f0f0f0;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 56rpx;
  height: 56rpx;
  background-color: #1890ff;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #ffffff;
}

.form-section {
  background-color: #ffffff;
  margin-bottom: 40rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 32rpx 40rpx;
  border-bottom: 1px solid #f8f8f8;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 30rpx;
  color: #333333;
  width: 160rpx;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
  text-align: right;
}

.form-input::placeholder {
  color: #cccccc;
}

.form-textarea {
  flex: 1;
  min-height: 160rpx;
  font-size: 30rpx;
  color: #333333;
  padding: 16rpx 0;
  text-align: right;
}

.form-textarea::placeholder {
  color: #cccccc;
}

.gender-selector {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 40rpx;
}

.gender-option {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  border: 1px solid #e0e0e0;
  border-radius: 32rpx;
  background-color: #ffffff;
}

.gender-option.active {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.gender-text {
  font-size: 28rpx;
  color: #666666;
  margin-left: 8rpx;
}

.gender-option.active .gender-text {
  color: #1890ff;
}

.date-picker,
.region-picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.date-text,
.region-text {
  font-size: 30rpx;
  color: #333333;
  margin-right: 16rpx;
}

.date-text.placeholder,
.region-text.placeholder {
  color: #cccccc;
}

.save-section {
  padding: 0rpx 20rpx 20rpx;
}
</style>
