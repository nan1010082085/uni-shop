<template>
  <view class="search-bar">
    <u-search
      v-model="searchValue"
      :placeholder="placeholder"
      :show-action="false"
      :disabled="disabled"
      :bg-color="bgColor"
      :color="color"
      :border-color="borderColor"
      :height="height"
      :margin="margin"
      @click="handleClick"
      @search="handleSearch"
      @clear="handleClear"
    >
      <template #suffix>
        <u-icon name="scan" size="20" color="#909399" @click="handleScan" />
      </template>
    </u-search>
  </view>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '@/router'
import { ref } from 'vue'

/**
 * 搜索栏组件属性接口
 */
interface SearchBarProps {
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 背景颜色 */
  bgColor?: string
  /** 文字颜色 */
  color?: string
  /** 边框颜色 */
  borderColor?: string
  /** 高度 */
  height?: string
  /** 外边距 */
  margin?: string
}

/**
 * 搜索栏组件事件接口
 */
interface SearchBarEmits {
  /** 点击搜索栏事件 */
  (e: 'click'): void
  /** 搜索事件 */
  (e: 'search', value: string): void
  /** 清空事件 */
  (e: 'clear'): void
  /** 扫码事件 */
  (e: 'scan'): void
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  placeholder: '搜索商品',
  disabled: false,
  bgColor: '#f5f5f5',
  color: '#606266',
  borderColor: 'transparent',
  height: '64rpx',
  margin: '0 30rpx',
})

const emit = defineEmits<SearchBarEmits>()

// 搜索值
const searchValue = ref('')

const router = useRouter()
const route = useRoute()

/**
 * 处理点击搜索栏
 */
const handleClick = (): void => {
  // 跳转到搜索页面
  router.push({
    path: '/pages/search/index',
    query: {
      redirect: route.path,
    },
  })
  emit('click')
}

/**
 * 处理搜索
 * @param value - 搜索值
 */
const handleSearch = (value: string): void => {
  emit('search', value)
}

/**
 * 处理清空
 */
const handleClear = (): void => {
  searchValue.value = ''
  emit('clear')
}

/**
 * 处理扫码
 */
const handleScan = (): void => {
  emit('scan')
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 44px;
}
</style>
