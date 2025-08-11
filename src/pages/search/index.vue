<template>
  <view class="search-page">
    <!-- 搜索头部 -->
    <view class="search-header" :style="{ paddingTop: viewTopBottom.top + 'px' }">
      <view class="search-bar">
        <u-icon name="arrow-left" size="20" color="#303133" @click="handleBack" />
        <view class="search-input-wrapper">
          <u-search 
            v-model="searchValue"
            placeholder="搜索商品"
            :show-action="false"
            bg-color="#f8f8f8"
            border-color="transparent"
            height="70rpx"
            margin="0 20rpx"
            @search="handleSearch"
            @focus="handleSearchFocus"
            @clear="handleSearchClear"
          />
        </view>
        <text class="search-btn" @click="handleSearch">搜索</text>
      </view>
    </view>

    <!-- 搜索历史 -->
    <view class="section-header">
      <text class="section-title">搜索历史</text>
      <u-icon name="trash" size="16" color="#909399" @click="clearSearchHistory" />
    </view>
    <view v-if="!isSearching && searchHistory.length > 0" class="search-section">
      <view class="history-tags">
        <view class="tag" v-for="(item, index) in searchHistory">
          <u-tag :key="index" :text="item" type="info" plain size="medium" @click="handleHistoryClick(item)" />
        </view>
      </view>
    </view>

    <!-- 猜你想搜 -->
    <view class="section-header">
      <text class="section-title">猜你想搜</text>
      <u-icon size="28rpx" name="reload" @click="handleReloadClick"></u-icon>
    </view>
    <view v-if="!isSearching" class="search-section">
      <view class="suggestion-tags">
        <view class="tag" v-for="(item, index) in searchSuggestions">
          <u-tag :key="index" :text="item" type="primary" plain size="medium" @click="handleSuggestionClick(item)" />
        </view>
      </view>
    </view>

    <!-- 猜你喜欢 -->
    <view class="section-header">
      <view class="hot-title">
        <text class="section-title hot-text">猜你喜欢</text>
      </view>
    </view>
    <view v-if="!isSearching" class="search-section">
      <!-- 瀑布流商品展示 -->
      <RecommendList :products="hotProducts" @productClick="handleProductClick" />
    </view>

    <!-- 搜索结果 -->
    <view v-if="isSearching" class="search-results">
      <view v-if="searchResults.length === 0" class="no-results">
        <u-empty mode="search" text="暂无搜索结果" textColor="#909399" textSize="28rpx" />
      </view>
      <view v-else>
        <RecommendList :products="searchResults" @productClick="handleProductClick" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import RecommendList from '@/components/RecommendList/index.vue'
import { useRoute, useRouter } from '@/router'
// import http from '@/api/request'
import { tabbarPath } from '@/utils/api_white_list'
import productData from '@/static/data/products.json'
import useSysTopBottom from '@/hooks/useSysTopBottom'

const router = useRouter()
const route = useRoute()

/**
 * 商品接口
 */
interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  tag?: string
  description?: string
}

/**
 * 商品数据接口
 */
interface ProductData {
  hotProducts: Product[]
  searchSuggestions: string[]
}

const viewTopBottom = useSysTopBottom()

// 搜索相关状态
const searchValue = ref<string>('')
const isSearching = ref<boolean>(false)
const searchHistory = ref<string[]>(['小米手机', 'iPad', '充电宝'])
const searchSuggestions = ref<string[]>([])
const hotProducts = ref<Product[]>([])
const searchResults = ref<Product[]>([])

/**
 * 加载商品数据
 */
const loadProductData = async (): Promise<void> => {
  try {
    // 模拟从静态文件加载数据
    // const response = await http.get('/static/data/products.json')
    // console.log(response)

    // if (response.statusCode === 200) {
    //   const data = response.data as ProductData
    //   hotProducts.value = data.hotProducts
    //   searchSuggestions.value = data.searchSuggestions
    // }
    hotProducts.value = productData.hotProducts
    searchSuggestions.value = productData.searchSuggestions
  } catch (error) {
    console.error('加载商品数据失败:', error)
    // 使用默认数据
    useDefaultData()
  }
}

/**
 * 使用默认数据
 */
const useDefaultData = (): void => {
  hotProducts.value = [
    {
      id: 1,
      name: 'REDMI K80 至尊版',
      price: 3999,
      originalPrice: 4299,
      image: '/static/logo.png',
      tag: '新',
      description: '天玑9400+ | 新一代骁龙芯',
    },
    {
      id: 2,
      name: '小米手环10',
      price: 299,
      image: '/static/logo.png',
      tag: '新',
      description: '健康监测 | 运动追踪',
    },
    {
      id: 3,
      name: 'REDMI Turbo 4 Pro',
      price: 2299,
      image: '/static/logo.png',
      tag: '新',
      description: '性能旗舰 | 游戏利器',
    },
    {
      id: 4,
      name: '米家智能电饭煲P1',
      price: 399,
      image: '/static/logo.png',
      description: '智能烹饪 | 营养保鲜',
    },
  ]

  searchSuggestions.value = ['空调', '充电宝', '洗衣机', '笔记本', '电视', '路由器', '油烟机', '小米手环', '智能门锁']
}

/**
 * 返回上一页
 */
const handleBack = (): void => {
  const redirect = decodeURIComponent(route.query.redirect)
  if (redirect) {
    if (tabbarPath.includes(`/${redirect}`)) {
      router.pushTab(`/${redirect}`)
    } else {
      router.replace({
        path: redirect,
      })
    }
  } else {
    uni.navigateBack()
  }
}

/**
 * 处理搜索
 */
const handleSearch = (): void => {
  if (!searchValue.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none',
    })
    return
  }

  // 添加到搜索历史
  addToSearchHistory(searchValue.value)

  // 执行搜索
  performSearch(searchValue.value)
}

/**
 * 执行搜索
 * @param keyword - 搜索关键词
 */
const performSearch = (keyword: string): void => {
  isSearching.value = true

  // 模拟搜索结果
  searchResults.value = hotProducts.value.filter(
    product =>
      product.name.toLowerCase().includes(keyword.toLowerCase()) ||
      product.description?.toLowerCase().includes(keyword.toLowerCase()),
  )

  console.log(`搜索关键词: ${keyword}, 结果数量: ${searchResults.value.length}`)
}

/**
 * 搜索框获得焦点
 */
const handleSearchFocus = (): void => {
  console.log('搜索框获得焦点')
}

/**
 * 清空搜索
 */
const handleSearchClear = (): void => {
  searchValue.value = ''
  isSearching.value = false
  searchResults.value = []
}

/**
 * 添加到搜索历史
 * @param keyword - 搜索关键词
 */
const addToSearchHistory = (keyword: string): void => {
  const trimmedKeyword = keyword.trim()
  if (!trimmedKeyword) return

  // 移除重复项
  const index = searchHistory.value.indexOf(trimmedKeyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }

  // 添加到开头
  searchHistory.value.unshift(trimmedKeyword)

  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }

  // 保存到本地存储
  uni.setStorageSync('searchHistory', searchHistory.value)
}

/**
 * 清空搜索历史
 */
const clearSearchHistory = (): void => {
  uni.showModal({
    title: '提示',
    content: '确定要清空搜索历史吗？',
    success: res => {
      if (res.confirm) {
        searchHistory.value = []
        uni.removeStorageSync('searchHistory')
      }
    },
  })
}

/**
 * 点击搜索历史
 * @param keyword - 历史关键词
 */
const handleHistoryClick = (keyword: string): void => {
  searchValue.value = keyword
  performSearch(keyword)
}

/**
 * 点击搜索建议
 * @param keyword - 建议关键词
 */
const handleSuggestionClick = (keyword: string): void => {
  searchValue.value = keyword
  addToSearchHistory(keyword)
  performSearch(keyword)
}

/**
 * 处理商品点击
 * @param product - 商品信息
 */
const handleProductClick = (product: Product): void => {
  console.log('点击商品:', product)
  uni.showToast({
    title: `点击了 ${product.name}`,
    icon: 'none',
  })
}

/**
 * 加载搜索历史
 */
const loadSearchHistory = (): void => {
  try {
    const history = uni.getStorageSync('searchHistory')
    if (history && Array.isArray(history)) {
      searchHistory.value = history
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

//刷新搜索历史
const handleReloadClick = () => {
  loadSearchHistory()
}

onMounted(() => {
  loadSearchHistory()
  loadProductData()
})
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.search-header {
  padding: 20rpx 0;
  background-color: #fff;
  // #ifdef MP-WEIXIN
  padding-top: 110rpx;
  // #endif
  // #ifdef APP-PLUS
  padding-top: 40rpx;
  // #endif

  .search-bar {
    display: flex;
    align-items: center;
    padding: 0 20rpx;

    .search-input-wrapper {
      flex: 1;
    }

    .search-btn {
      font-size: 28rpx;
      color: $u-main-color;
      font-weight: 500;
    }
  }
}

.section-header {
  padding: 20rpx 20rpx 0;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $u-main-color;
  }

  .hot-title {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .hot-text {
      color: $u-main-color;
    }
  }
}
.search-section {
  margin: 0 20rpx;
  padding: 20rpx 0;
  border-radius: 10rpx;
  background-color: #ffffff;

  .history-tags,
  .suggestion-tags {
    display: flex;
    flex-wrap: wrap;

    .tag {
      margin: 0 12rpx 12rpx 0;
      background-color: #fff;
    }
  }
}

.search-results {
  background-color: #fff;

  .no-results {
    padding: 100rpx 0;
    text-align: center;
  }
}
</style>
