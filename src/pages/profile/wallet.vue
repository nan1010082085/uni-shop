<template>
  <nav-bar title="我的钱包" />
  <view class="wallet-container">
    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="balance-header">
        <text class="balance-label">账户余额</text>
        <view class="eye-icon" @click="toggleBalanceVisible">
          <u-icon :name="balanceVisible ? 'eye' : 'eye-off'" color="#ffffff" size="16"></u-icon>
        </view>
      </view>
      <view class="balance-amount">
        <text class="currency">¥</text>
        <text class="amount">{{ balanceVisible ? walletData.balance.toFixed(2) : '****' }}</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn" @click="handleRecharge">
          <u-icon name="plus-circle" color="#ffffff" size="20"></u-icon>
          <text class="btn-text">充值</text>
        </view>
        <view class="action-btn" @click="handleWithdraw">
          <u-icon name="minus-circle" color="#ffffff" size="20"></u-icon>
          <text class="btn-text">提现</text>
        </view>
        <view class="action-btn" @click="handleTransfer">
          <u-icon name="red-packet" color="#ffffff" size="20"></u-icon>
          <text class="btn-text">转账</text>
        </view>
      </view>
    </view>

    <!-- 银行卡管理 -->
    <view class="card-section">
      <view class="section-header">
        <text class="section-title">银行卡管理</text>
        <view class="add-card" @click="handleAddCard">
          <u-icon name="plus" color="#1890ff" size="16"></u-icon>
          <text class="add-text">添加银行卡</text>
        </view>
      </view>

      <view class="card-list" v-if="walletData.bankCards.length > 0">
        <view class="card-item" v-for="card in walletData.bankCards" :key="card.id" @click="handleCardClick(card)">
          <view class="card-icon">
            <image src="/static/icons/icon-card.png" style="width: 80rpx; height: 80rpx;"></image>
          </view>
          <view class="card-info">
            <text class="card-bank">{{ card.bankName }}</text>
            <text class="card-number">**** **** **** {{ card.cardNumber.slice(-4) }}</text>
          </view>
          <view class="card-status">
            <text class="status-text" :class="{ default: card.isDefault }">{{ card.isDefault ? '默认' : '' }}</text>
            <u-icon name="arrow-right" color="#cccccc" size="14"></u-icon>
          </view>
        </view>
      </view>

      <view class="empty-cards" v-else>
        <u-icon name="coupon" color="#cccccc" size="40"></u-icon>
        <text class="empty-text">暂无银行卡</text>
        <text class="empty-desc">添加银行卡，享受更便捷的支付体验</text>
      </view>
    </view>

    <!-- 交易记录 -->
    <view class="transaction-section">
      <view class="section-header">
        <text class="section-title">交易记录</text>
        <view class="filter-btn" @click="handleOpenFilter">
          <image src="/static/icons/icon-filter.png" style="width: 32rpx; height: 32rpx;"></image>
          <text class="filter-text">筛选</text>
        </view>
      </view>

      <view class="transaction-list" v-if="filteredTransactions.length > 0">
        <view class="transaction-item" v-for="transaction in filteredTransactions" :key="transaction.id">
          <view class="transaction-icon" :class="transaction.type">
            <u-icon :name="getTransactionIcon(transaction.type)" color="#ffffff" size="16"></u-icon>
          </view>

          <view class="transaction-info">
            <text class="transaction-title">{{ transaction.payMethod }}</text>
            <text class="transaction-time">{{ formatTime(transaction.time) }}</text>
          </view>

          <view class="transaction-amount">
            <text class="amount-text" :class="transaction.type">
              {{ transaction.type === 'income' ? '+' : '-' }}¥{{ Math.abs(transaction.amount).toFixed(2) }}
            </text>
            <text class="status-text" :class="transaction.status">{{ getStatusText(transaction.status) }}</text>
          </view>
        </view>
      </view>

      <view class="empty-transactions" v-else>
        <u-icon name="file-text" color="#cccccc" size="40"></u-icon>
        <text class="empty-text">暂无交易记录</text>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <u-popup :show="showFilterPopup" mode="bottom" border-radius="20" :safe-area-inset-bottom="true">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">筛选条件</text>
          <u-icon name="close" color="#666666" size="20" @click="showFilterPopup = false"></u-icon>
        </view>

        <view class="filter-content">
          <view class="filter-group">
            <text class="group-title">交易类型</text>
            <view class="filter-options">
              <view class="filter-option" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">
                <text class="option-text">全部</text>
              </view>
              <view class="filter-option" :class="{ active: filterType === 'income' }" @click="filterType = 'income'">
                <text class="option-text">收入</text>
              </view>
              <view class="filter-option" :class="{ active: filterType === 'expense' }" @click="filterType = 'expense'">
                <text class="option-text">支出</text>
              </view>
            </view>
          </view>

          <view class="filter-group">
            <text class="group-title">交易状态</text>
            <view class="filter-options">
              <view class="filter-option" :class="{ active: filterStatus === 'all' }" @click="filterStatus = 'all'">
                <text class="option-text">全部</text>
              </view>
              <view
                class="filter-option"
                :class="{ active: filterStatus === 'success' }"
                @click="filterStatus = 'success'"
              >
                <text class="option-text">成功</text>
              </view>
              <view
                class="filter-option"
                :class="{ active: filterStatus === 'pending' }"
                @click="filterStatus = 'pending'"
              >
                <text class="option-text">处理中</text>
              </view>
              <view
                class="filter-option"
                :class="{ active: filterStatus === 'failed' }"
                @click="filterStatus = 'failed'"
              >
                <text class="option-text">失败</text>
              </view>
            </view>
          </view>
        </view>

        <view class="filter-actions">
          <u-button type="default" size="normal" @click="resetFilter"> 重置 </u-button>
          <u-button type="primary" size="normal" @click="applyFilter"> 确定 </u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import walletsData from '@/static/data/wallet.json'

/**
 * 银行卡接口
 */
interface BankCard {
  id: number
  bankName: string
  cardNumber: string
  isDefault: boolean
}

/**
 * 交易记录接口
 */
interface Transaction {
  id: number
  payMethod: string
  type: 'income' | 'expense'
  amount: number
  status: 'success' | 'pending' | 'failed'
  time: string
  orderId?: string
}

/**
 * 钱包数据接口
 */
interface WalletData {
  balance: number
  bankCards: BankCard[]
  transactions: Transaction[]
}

/**
 * 钱包数据
 */
const walletData = ref<WalletData>({
  balance: 0,
  bankCards: [],
  transactions: [],
})

/**
 * 余额是否可见
 */
const balanceVisible = ref<boolean>(true)

/**
 * 显示筛选弹窗
 */
const showFilterPopup = ref<boolean>(false)

/**
 * 筛选类型
 */
const filterType = ref<string>('all')

/**
 * 筛选状态
 */
const filterStatus = ref<string>('all')

/**
 * 筛选后的交易记录
 */
const filteredTransactions = computed(() => {
  let transactions = walletData.value.transactions

  if (!showFilterPopup.value && filterType.value !== 'all') {
    transactions = transactions.filter(item => item.type === filterType.value)
  }

  if (!showFilterPopup.value && filterStatus.value !== 'all') {
    transactions = transactions.filter(item => item.status === filterStatus.value)
  }

  return transactions
})

/**
 * 加载钱包数据
 */
const loadWalletData = () => {
  walletData.value = walletsData as WalletData
}

/**
 * 切换余额可见性
 */
const toggleBalanceVisible = () => {
  balanceVisible.value = !balanceVisible.value
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
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

/**
 * 获取交易图标
 * @param type 交易类型
 */
const getTransactionIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    income: 'arrow-down',
    expense: 'arrow-up',
  }
  return iconMap[type] || 'file-text'
}

/**
 * 获取状态文本
 * @param status 状态
 */
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    success: '成功',
    pending: '处理中',
    failed: '失败',
  }
  return statusMap[status] || '未知'
}

/**
 * 处理充值
 */
const handleRecharge = () => {
  uni.showToast({
    title: '充值功能开发中',
    icon: 'none',
  })
}

/**
 * 处理提现
 */
const handleWithdraw = () => {
  uni.showToast({
    title: '提现功能开发中',
    icon: 'none',
  })
}

/**
 * 处理转账
 */
const handleTransfer = () => {
  uni.showToast({
    title: '转账功能开发中',
    icon: 'none',
  })
}

/**
 * 处理添加银行卡
 */
const handleAddCard = () => {
  uni.showToast({
    title: '添加银行卡功能开发中',
    icon: 'none',
  })
}

/**
 * 处理银行卡点击
 * @param card 银行卡信息
 */
const handleCardClick = (card: BankCard) => {
  uni.showActionSheet({
    itemList: ['设为默认', '解绑银行卡'],
    success: res => {
      if (res.tapIndex === 0) {
        // 设为默认
        walletData.value.bankCards.forEach(item => {
          item.isDefault = item.id === card.id
        })
        uni.showToast({
          title: '已设为默认银行卡',
          icon: 'success',
        })
      } else if (res.tapIndex === 1) {
        // 解绑银行卡
        uni.showModal({
          title: '提示',
          content: '确定要解绑这张银行卡吗？',
          success: modalRes => {
            if (modalRes.confirm) {
              const index = walletData.value.bankCards.findIndex(item => item.id === card.id)
              if (index > -1) {
                walletData.value.bankCards.splice(index, 1)
                uni.showToast({
                  title: '银行卡已解绑',
                  icon: 'success',
                })
              }
            }
          },
        })
      }
    },
  })
}

const handleOpenFilter = () => {
  showFilterPopup.value = true
}

/**
 * 重置筛选
 */
const resetFilter = () => {
  filterType.value = 'all'
  filterStatus.value = 'all'
}

/**
 * 应用筛选
 */
const applyFilter = () => {
  showFilterPopup.value = false
  uni.showToast({
    title: '筛选已应用',
    icon: 'success',
  })
}

/**
 * 页面加载时获取数据
 */
onMounted(() => {
  loadWalletData()
})
</script>

<style lang="scss" scoped>
.wallet-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 88rpx;
  // #ifdef MP-WEIXIN
  padding-top: 177rpx;
  // #endif
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 10px;
  padding: 30px 20px;
  border-radius: 16px;
  color: #ffffff;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.balance-label {
  font-size: 14px;
  opacity: 0.8;
}

.eye-icon {
  padding: 4px;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 30px;
}

.currency {
  font-size: 18px;
  margin-right: 4px;
}

.amount {
  font-size: 36px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  justify-content: space-around;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
}

.btn-text {
  font-size: 12px;
  margin-top: 6px;
  opacity: 0.9;
}

.card-section,
.transaction-section {
  background-color: #ffffff;
  margin: 10px;
  border-radius: 12px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.add-card,
.filter-btn {
  display: flex;
  align-items: center;
}

.add-text,
.filter-text {
  font-size: 14px;
  color: #1890ff;
  margin-left: 4px;
}

.filter-text {
  color: #666666;
}

.card-list,
.transaction-list {
  padding: 10px 0;
}

.card-item,
.transaction-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f8f8f8;
}

.card-item:last-child,
.transaction-item:last-child {
  border-bottom: none;
}

.card-icon,
.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.transaction-icon.income {
  background-color: #52c41a;
}

.transaction-icon.expense {
  background-color: #ff6b6b;
}

.card-info,
.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-bank,
.transaction-title {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
}

.card-number,
.transaction-time {
  font-size: 13px;
  color: #666666;
}

.card-status {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 12px;
  color: #999999;
  margin-right: 8px;
}

.status-text.default {
  color: #1890ff;
}

.transaction-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount-text {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.amount-text.income {
  color: #52c41a;
}

.amount-text.expense {
  color: #ff6b6b;
}

.status-text.success {
  color: #52c41a;
}

.status-text.pending {
  color: #faad14;
}

.status-text.failed {
  color: #ff6b6b;
}

.empty-cards,
.empty-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 16px;
  color: #666666;
  margin-top: 16px;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #999999;
}

.filter-popup {
  background-color: #ffffff;
  max-height: 60vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.filter-content {
  padding: 20px;
}

.filter-group {
  margin-bottom: 24px;
}

.group-title {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12px;
  display: block;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-option {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background-color: #ffffff;
}

.filter-option.active {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.option-text {
  font-size: 14px;
  color: #666666;
}

.filter-option.active .option-text {
  color: #1890ff;
}

.filter-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.filter-actions .u-button {
  flex: 1;
}
</style>
