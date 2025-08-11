<template>
  <nav-bar title="身份认证" />
  <view class="identity-container" :style="{ paddingTop: pageTop.top + 'px' }">
    <scroll-view scroll-y class="scroll-container">
      <!-- 认证状态提示 -->
      <view class="status-section">
        <view class="status-card" :class="statusClass">
          <view class="status-icon">
            <u-icon :name="statusIcon" :color="statusIconColor" size="24"></u-icon>
          </view>
          <view class="status-info">
            <text class="status-title">{{ statusTitle }}</text>
            <text class="status-desc">{{ statusDesc }}</text>
          </view>
        </view>
      </view>

      <!-- 身份信息表单 -->
      <view class="form-section">
        <text class="section-title">身份信息</text>
        
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <input 
            class="form-input" 
            v-model="identityInfo.realName" 
            placeholder="请输入真实姓名"
            :disabled="isVerified"
            maxlength="20"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">身份证号</text>
          <input 
            class="form-input" 
            v-model="identityInfo.idCard" 
            placeholder="请输入身份证号码"
            :disabled="isVerified"
            maxlength="18"
          />
        </view>
      </view>

      <!-- 证件照片上传 -->
      <view class="upload-section" v-if="!isVerified">
        <text class="section-title">证件照片</text>
        
        <view class="upload-item">
          <text class="upload-label">身份证正面</text>
          <view class="upload-container">
            <view class="upload-box" @click="handleUpload('front')">
              <image 
                v-if="identityInfo.frontImage" 
                class="upload-image" 
                :src="identityInfo.frontImage" 
                mode="aspectFill"
              ></image>
              <view v-else class="upload-placeholder">
                <u-icon name="camera" color="#cccccc" size="32"></u-icon>
                <text class="upload-text">上传正面照</text>
              </view>
            </view>
            <text class="upload-tip">请上传身份证正面照片</text>
          </view>
        </view>
        
        <view class="upload-item">
          <text class="upload-label">身份证反面</text>
          <view class="upload-container">
            <view class="upload-box" @click="handleUpload('back')">
              <image 
                v-if="identityInfo.backImage" 
                class="upload-image" 
                :src="identityInfo.backImage" 
                mode="aspectFill"
              ></image>
              <view v-else class="upload-placeholder">
                <u-icon name="camera" color="#cccccc" size="32"></u-icon>
                <text class="upload-text">上传反面照</text>
              </view>
            </view>
            <text class="upload-tip">请上传身份证反面照片</text>
          </view>
        </view>
      </view>

      <!-- 认证须知 -->
      <view class="notice-section">
        <text class="section-title">认证须知</text>
        
        <view class="notice-content">
          <view class="notice-item">
            <u-icon name="checkmark-circle" color="#52c41a" size="16"></u-icon>
            <text class="notice-text">请确保身份证信息清晰可见</text>
          </view>
          <view class="notice-item">
            <u-icon name="checkmark-circle" color="#52c41a" size="16"></u-icon>
            <text class="notice-text">照片格式支持JPG、PNG</text>
          </view>
          <view class="notice-item">
            <u-icon name="checkmark-circle" color="#52c41a" size="16"></u-icon>
            <text class="notice-text">单张照片大小不超过5MB</text>
          </view>
          <view class="notice-item">
            <u-icon name="checkmark-circle" color="#52c41a" size="16"></u-icon>
            <text class="notice-text">认证信息仅用于身份验证，严格保密</text>
          </view>
          <view class="notice-item">
            <u-icon name="checkmark-circle" color="#52c41a" size="16"></u-icon>
            <text class="notice-text">认证通过后无法修改，请仔细核对</text>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section" v-if="!isVerified">
        <u-button 
          type="primary" 
          size="large" 
          :loading="submitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ submitting ? '提交中...' : '提交认证' }}
        </u-button>
      </view>

      <!-- 重新认证按钮 -->
      <view class="resubmit-section" v-if="identityInfo.status === 'rejected'">
        <u-button 
          type="warning" 
          size="large" 
          @click="handleResubmit"
        >
          重新认证
        </u-button>
      </view>
    </scroll-view>

    <!-- 图片选择弹窗 -->
    <u-action-sheet
      v-model="showImageSheet"
      :actions="imageActions"
      @select="handleImageSelect"
      cancel-text="取消"
    ></u-action-sheet>
  </view>
</template>
<script setup lang="ts">
import NavBar from '@/components/NavBar/index.vue'
import useSysTopBottom from '@/hooks/useSysTopBottom'
import { ref, reactive, computed, onMounted } from 'vue'

/**
 * 认证状态类型
 */
type VerifyStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

/**
 * 身份信息接口
 */
interface IdentityInfo {
  realName: string
  idCard: string
  frontImage: string
  backImage: string
  status: VerifyStatus
  rejectReason?: string
  verifyTime?: string
}

const pageTop = useSysTopBottom()
/**
 * 身份信息
 */
const identityInfo = reactive<IdentityInfo>({
  realName: '',
  idCard: '',
  frontImage: '',
  backImage: '',
  status: 'unverified'
})

/**
 * 提交状态
 */
const submitting = ref<boolean>(false)

/**
 * 显示图片选择弹窗
 */
const showImageSheet = ref<boolean>(false)

/**
 * 当前上传类型
 */
const currentUploadType = ref<'front' | 'back'>('front')

/**
 * 图片选择操作
 */
const imageActions = ref([
  {
    name: '拍照',
    value: 'camera'
  },
  {
    name: '从相册选择',
    value: 'album'
  }
])

/**
 * 是否已认证
 */
const isVerified = computed(() => identityInfo.status === 'verified')

/**
 * 是否可以提交
 */
const canSubmit = computed(() => {
  return identityInfo.realName.trim() && 
         identityInfo.idCard.trim() && 
         identityInfo.frontImage && 
         identityInfo.backImage
})

/**
 * 状态样式类
 */
const statusClass = computed(() => {
  return {
    'status-unverified': identityInfo.status === 'unverified',
    'status-pending': identityInfo.status === 'pending',
    'status-verified': identityInfo.status === 'verified',
    'status-rejected': identityInfo.status === 'rejected'
  }
})

/**
 * 状态图标
 */
const statusIcon = computed(() => {
  const iconMap = {
    unverified: 'info-circle',
    pending: 'clock',
    verified: 'checkmark-circle',
    rejected: 'close-circle'
  }
  return iconMap[identityInfo.status]
})

/**
 * 状态图标颜色
 */
const statusIconColor = computed(() => {
  const colorMap = {
    unverified: '#1890ff',
    pending: '#faad14',
    verified: '#52c41a',
    rejected: '#ff4d4f'
  }
  return colorMap[identityInfo.status]
})

/**
 * 状态标题
 */
const statusTitle = computed(() => {
  const titleMap = {
    unverified: '未认证',
    pending: '认证中',
    verified: '已认证',
    rejected: '认证失败'
  }
  return titleMap[identityInfo.status]
})

/**
 * 状态描述
 */
const statusDesc = computed(() => {
  const descMap = {
    unverified: '请完成身份认证，享受更多服务',
    pending: '您的认证信息正在审核中，请耐心等待',
    verified: `认证通过时间：${identityInfo.verifyTime}`,
    rejected: `认证失败原因：${identityInfo.rejectReason || '信息不符'}`
  }
  return descMap[identityInfo.status]
})

/**
 * 加载身份信息
 */
const loadIdentityInfo = () => {
  // 模拟从本地存储或API获取身份信息
  const savedIdentityInfo = uni.getStorageSync('identityInfo')
  if (savedIdentityInfo) {
    Object.assign(identityInfo, savedIdentityInfo)
  }
}

/**
 * 处理图片上传
 * @param type 上传类型
 */
const handleUpload = (type: 'front' | 'back') => {
  currentUploadType.value = type
  showImageSheet.value = true
}

/**
 * 图片选择操作接口
 */
interface ImageAction {
  name: string
  value: 'camera' | 'album'
}

/**
 * 处理图片选择
 * @param action 选择的操作
 */
const handleImageSelect = (action: ImageAction) => {
  showImageSheet.value = false
  
  const sourceType = action.value === 'camera' ? ['camera'] : ['album']
  
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      
      // 这里可以上传到服务器，现在先直接使用本地路径
      if (currentUploadType.value === 'front') {
        identityInfo.frontImage = tempFilePath
      } else {
        identityInfo.backImage = tempFilePath
      }
      
      uni.showToast({
        title: '图片上传成功',
        icon: 'success'
      })
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      uni.showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  })
}

/**
 * 验证身份证号
 * @param idCard 身份证号
 */
const validateIdCard = (idCard: string): boolean => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

/**
 * 验证表单
 */
const validateForm = (): boolean => {
  if (!identityInfo.realName.trim()) {
    uni.showToast({
      title: '请输入真实姓名',
      icon: 'none'
    })
    return false
  }
  
  if (!identityInfo.idCard.trim()) {
    uni.showToast({
      title: '请输入身份证号码',
      icon: 'none'
    })
    return false
  }
  
  if (!validateIdCard(identityInfo.idCard)) {
    uni.showToast({
      title: '请输入正确的身份证号码',
      icon: 'none'
    })
    return false
  }
  
  if (!identityInfo.frontImage) {
    uni.showToast({
      title: '请上传身份证正面照片',
      icon: 'none'
    })
    return false
  }
  
  if (!identityInfo.backImage) {
    uni.showToast({
      title: '请上传身份证反面照片',
      icon: 'none'
    })
    return false
  }
  
  return true
}

/**
 * 处理提交认证
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  submitting.value = true
  
  try {
    // 模拟提交到服务器
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新状态为审核中
    identityInfo.status = 'pending'
    
    // 保存到本地存储
    uni.setStorageSync('identityInfo', identityInfo)
    
    uni.showToast({
      title: '提交成功，请等待审核',
      icon: 'success'
    })
    
    // 模拟审核结果（实际应该由后端推送）
    setTimeout(() => {
      // 随机审核结果
      const isApproved = Math.random() > 0.3
      if (isApproved) {
        identityInfo.status = 'verified'
        identityInfo.verifyTime = new Date().toLocaleDateString('zh-CN')
      } else {
        identityInfo.status = 'rejected'
        identityInfo.rejectReason = '身份证照片不清晰，请重新上传'
      }
      uni.setStorageSync('identityInfo', identityInfo)
    }, 3000)
    
  } catch (error) {
    console.error('提交失败:', error)
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

/**
 * 处理重新认证
 */
const handleResubmit = () => {
  identityInfo.status = 'unverified'
  identityInfo.rejectReason = ''
  identityInfo.verifyTime = ''
  uni.setStorageSync('identityInfo', identityInfo)
  
  uni.showToast({
    title: '可以重新提交认证',
    icon: 'success'
  })
}

/**
 * 页面加载时获取数据
 */
onMounted(() => {
  loadIdentityInfo()
})
</script>

<style lang="scss" scoped>
.identity-container {
  height: 100vh;
  background-color: #f5f5f5;
}

.scroll-container {
  height: 100%;
}

.status-section {
  padding: 40rpx;
}

.status-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  border-left: 8rpx solid #1890ff;
}

.status-card.status-pending {
  border-left-color: #faad14;
}

.status-card.status-verified {
  border-left-color: #52c41a;
}

.status-card.status-rejected {
  border-left-color: #ff4d4f;
}

.status-icon {
  margin-right: 32rpx;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.status-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}

.status-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.4;
}

.form-section,
.upload-section,
.notice-section {
  background-color: #ffffff;
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  padding: 40rpx 40rpx 0;
  display: block;
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

.form-input:disabled {
  color: #999999;
  background-color: transparent;
}

.upload-item {
  padding: 32rpx 40rpx;
  border-bottom: 1px solid #f8f8f8;
}

.upload-item:last-child {
  border-bottom: none;
}

.upload-label {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 24rpx;
  display: block;
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-box {
  width: 240rpx;
  height: 160rpx;
  border: 4rpx dashed #d9d9d9;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  margin-bottom: 16rpx;
}

.upload-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-text {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #999999;
  text-align: center;
}

.notice-content {
  padding: 0 40rpx 40rpx;
}

.notice-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 8rpx;
  height: 60rpx;
}

.notice-item:last-child {
  margin-bottom: 0;
}

.notice-text {
  font-size: 28rpx;
  color: #666666;
  margin-left: 16rpx;
  line-height: 1.4;
  flex: 1;
}

.submit-section,
.resubmit-section {
  padding: 60rpx 40rpx;
}
</style>
