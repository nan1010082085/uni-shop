<template>
  <nav-bar title="地址管理" />
  <view class="address-container" :style="{ paddingTop: pageTop.top + 'px' }">
    <!-- 地址列表 -->
    <view class="address-list" v-if="addressList.length > 0">
      <view class="address-item" v-for="item in addressList" :key="item.id" @click="handleAddressClick(item)">
        <view class="address-content">
          <view class="address-header">
            <view class="user-info">
              <text class="user-name">{{ item.name }}</text>
              <text class="user-phone">{{ item.phone }}</text>
            </view>
            <view class="default-badge" v-if="item.isDefault">
              <u-text type="primary" class="badge-text" text="默认"></u-text>
            </view>
          </view>

          <view class="address-detail">
            <text class="address-text">{{ item.fullAddress }}</text>
            <text class="address-tag" v-if="item.tag">[{{ item.tag }}]</text>
          </view>

          <view class="address-actions">
            <view class="action-btn" @click.stop="handleSetDefault(item)">
              <u-icon
                :name="item.isDefault ? 'checkmark-circle-fill' : 'checkmark-circle'"
                :color="item.isDefault ? '#ff6b6b' : '#cccccc'"
                size="16"
              ></u-icon>
              <text class="action-text" :class="{ active: item.isDefault }">设为默认</text>
            </view>
            <view class="action-btn" @click.stop="handleEditAddress(item)">
              <u-icon name="edit-pen" color="#666666" size="16"></u-icon>
              <text class="action-text">编辑</text>
            </view>
            <view class="action-btn" @click.stop="handleDeleteAddress(item)">
              <u-icon name="trash" color="#ff6b6b" size="16"></u-icon>
              <text class="action-text delete">删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <u-icon name="map" color="#cccccc" size="80"></u-icon>
      <text class="empty-text">暂无收货地址</text>
      <text class="empty-desc">添加收货地址，享受便捷购物体验</text>
    </view>

    <!-- 添加地址按钮 -->
    <view class="add-address-btn" @click="handleAddAddress">
      <u-icon name="plus" color="#ffffff" size="20"></u-icon>
      <text class="add-btn-text">添加新地址</text>
    </view>

    <!-- 地址编辑弹窗 -->
    <u-popup v-model="showEditPopup" mode="bottom" border-radius="20" :safe-area-inset-bottom="true">
      <view class="edit-popup">
        <view class="popup-header">
          <text class="popup-title">{{ editingAddress.id ? '编辑地址' : '添加地址' }}</text>
          <u-icon name="close" color="#666666" size="20" @click="showEditPopup = false"></u-icon>
        </view>

        <view class="edit-form">
          <view class="form-item">
            <text class="form-label">收货人</text>
            <input class="form-input" v-model="editingAddress.name" placeholder="请输入收货人姓名" />
          </view>

          <view class="form-item">
            <text class="form-label">手机号</text>
            <input class="form-input" v-model="editingAddress.phone" placeholder="请输入手机号" type="number" />
          </view>

          <view class="form-item">
            <text class="form-label">所在地区</text>
            <view class="region-picker" @click="showRegionPicker">
              <text class="region-text" v-if="editingAddress.province">
                {{ editingAddress.province }} {{ editingAddress.city }} {{ editingAddress.district }}
              </text>
              <text class="region-placeholder" v-else>请选择省市区</text>
              <u-icon name="arrow-right" color="#cccccc" size="14"></u-icon>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">详细地址</text>
            <textarea
              class="form-textarea"
              v-model="editingAddress.detail"
              placeholder="请输入详细地址（街道、门牌号等）"
              maxlength="100"
            ></textarea>
          </view>

          <view class="form-item">
            <text class="form-label">地址标签</text>
            <view class="tag-options">
              <view
                class="tag-option"
                v-for="tag in tagOptions"
                :key="tag"
                :class="{ active: editingAddress.tag === tag }"
                @click="editingAddress.tag = tag"
              >
                <text class="tag-option-text">{{ tag }}</text>
              </view>
            </view>
          </view>

          <view class="form-item">
            <view class="default-switch">
              <text class="switch-label">设为默认地址</text>
              <u-switch v-model="editingAddress.isDefault" active-color="#ff6b6b"></u-switch>
            </view>
          </view>
        </view>

        <view class="popup-footer">
          <u-button type="primary" size="large" @click="handleSaveAddress" :loading="saving"> 保存地址 </u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import addressData from '@/static/data/address.json'
import useSysTopBottom from '@/hooks/useSysTopBottom'

/**
 * 地址数据接口
 */
interface Address {
  id?: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  fullAddress?: string
  isDefault: boolean
  tag: string
  createTime?: string
  updateTime?: string
}

const pageTop = useSysTopBottom()

/**
 * 地址列表
 */
const addressList = ref<Address[]>([])

/**
 * 显示编辑弹窗
 */
const showEditPopup = ref<boolean>(false)

/**
 * 正在编辑的地址
 */
const editingAddress = ref<Address>({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
  tag: '家',
})

/**
 * 保存中状态
 */
const saving = ref<boolean>(false)

/**
 * 标签选项
 */
const tagOptions = ref<string[]>(['家', '公司', '学校', '其他'])

/**
 * 加载地址数据
 */
const loadAddressData = () => {
  addressList.value = addressData.addressList as Address[]
}

/**
 * 处理地址点击
 * @param address 地址信息
 */
const handleAddressClick = (address: Address) => {
  // 如果是从订单页面跳转过来的，则选择地址并返回
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.options

  if (options?.from === 'order') {
    uni.navigateBack({
      success: () => {
        uni.$emit('selectAddress', address)
      },
    })
  }
}

/**
 * 设置默认地址
 * @param address 地址信息
 */
const handleSetDefault = (address: Address) => {
  if (address.isDefault) return

  // 取消其他地址的默认状态
  addressList.value.forEach(item => {
    item.isDefault = false
  })

  // 设置当前地址为默认
  address.isDefault = true

  uni.showToast({
    title: '已设为默认地址',
    icon: 'success',
  })
}

/**
 * 编辑地址
 * @param address 地址信息
 */
const handleEditAddress = (address: Address) => {
  editingAddress.value = { ...address }
  showEditPopup.value = true
}

/**
 * 删除地址
 * @param address 地址信息
 */
const handleDeleteAddress = (address: Address) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这个地址吗？',
    success: res => {
      if (res.confirm) {
        const index = addressList.value.findIndex(item => item.id === address.id)
        if (index > -1) {
          addressList.value.splice(index, 1)
          uni.showToast({
            title: '地址已删除',
            icon: 'success',
          })
        }
      }
    },
  })
}

/**
 * 添加新地址
 */
const handleAddAddress = () => {
  editingAddress.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
    tag: '家',
  }
  showEditPopup.value = true
}

/**
 * 显示地区选择器
 */
const showRegionPicker = () => {
  // 这里应该调用地区选择器组件
  uni.showToast({
    title: '地区选择功能待实现',
    icon: 'none',
  })
}

/**
 * 保存地址
 */
const handleSaveAddress = () => {
  // 表单验证
  if (!editingAddress.value.name.trim()) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return
  }

  if (!editingAddress.value.phone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }

  if (!/^1[3-9]\d{9}$/.test(editingAddress.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  if (!editingAddress.value.province) {
    uni.showToast({ title: '请选择所在地区', icon: 'none' })
    return
  }

  if (!editingAddress.value.detail.trim()) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return
  }

  saving.value = true

  setTimeout(() => {
    // 构建完整地址
    editingAddress.value.fullAddress = `${editingAddress.value.province}${editingAddress.value.city}${editingAddress.value.district}${editingAddress.value.detail}`

    if (editingAddress.value.id) {
      // 编辑地址
      const index = addressList.value.findIndex(item => item.id === editingAddress.value.id)
      if (index > -1) {
        editingAddress.value.updateTime = new Date().toISOString()
        addressList.value[index] = { ...editingAddress.value }
      }
    } else {
      // 添加新地址
      const newAddress = {
        ...editingAddress.value,
        id: Date.now(),
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      }
      addressList.value.push(newAddress)
    }

    // 如果设置为默认地址，取消其他地址的默认状态
    if (editingAddress.value.isDefault) {
      addressList.value.forEach(item => {
        if (item.id !== editingAddress.value.id) {
          item.isDefault = false
        }
      })
    }

    saving.value = false
    showEditPopup.value = false

    uni.showToast({
      title: editingAddress.value.id ? '地址已更新' : '地址已添加',
      icon: 'success',
    })
  }, 1000)
}

/**
 * 页面加载时获取数据
 */
onMounted(() => {
  loadAddressData()
})
</script>

<style lang="scss" scoped>
.address-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 160rpx;
  padding-top: 88rpx;
  // #ifdef MP-WEIXIN
  padding-top: 110rpx;
  // #endif
}

.address-list {
  padding: 40rpx 0;
}

.address-item {
  background-color: #ffffff;
  margin-bottom: 40rpx;
  padding: 40rpx;
}

.address-content {
  width: 100%;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-right: 24rpx;
}

.user-phone {
  font-size: 28rpx;
  color: #666666;
}

.default-badge {
  padding: 4rpx 16rpx;
}

.badge-text {
  font-size: 20rpx;
  color: #ffffff;
}

.address-detail {
  margin-bottom: 30rpx;
}

.address-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.4;
  margin-right: 16rpx;
}

.address-tag {
  font-size: 24rpx;
  color: #ff6b6b;
}

.address-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  flex: 1;
  justify-content: center;
}

.action-text {
  font-size: 24rpx;
  color: #666666;
  margin-left: 8rpx;
}

.action-text.active {
  color: #ff6b6b;
}

.action-text.delete {
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
  font-size: 32rpx;
  color: #666666;
  margin-top: 40rpx;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999999;
}

.add-address-btn {
  position: fixed;
  bottom: 60rpx;
  left: 40rpx;
  right: 40rpx;
  background-color: #ff6b6b;
  padding: 30rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
}

.add-btn-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
  margin-left: 16rpx;
}

.edit-popup {
  background-color: #ffffff;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 40rpx 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.edit-form {
  padding: 40rpx;
  max-height: 50vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 16rpx;
  display: block;
}

.form-input {
  width: 100%;
  padding: 24rpx 30rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 32rpx;
  color: #333333;
  background-color: #ffffff;
}

.form-textarea {
  width: 100%;
  padding: 24rpx 30rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 32rpx;
  color: #333333;
  background-color: #ffffff;
  min-height: 160rpx;
  resize: none;
}

.region-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  background-color: #ffffff;
}

.region-text {
  font-size: 32rpx;
  color: #333333;
}

.region-placeholder {
  font-size: 32rpx;
  color: #cccccc;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag-option {
  padding: 16rpx 32rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 40rpx;
  background-color: #ffffff;
}

.tag-option.active {
  border-color: #ff6b6b;
  background-color: #ff6b6b;
}

.tag-option-text {
  font-size: 24rpx;
  color: #666666;
}

.tag-option.active .tag-option-text {
  color: #ffffff;
}

.default-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch-label {
  font-size: 32rpx;
  color: #333333;
}

.popup-footer {
  padding: 40rpx;
  border-top: 2rpx solid #f0f0f0;
}
</style>
