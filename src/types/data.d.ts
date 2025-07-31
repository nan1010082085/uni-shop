/**
 * 商品接口
 */
export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  description?: string
  tag?: string
}

/**
 * 商品详情接口
 */
export interface ProductDetail {
  id: number
  name: string
  price: number
  originalPrice?: number
  images: string[]
  description: string
  tag?: string
  sales: number
  stock: number
  specifications: ProductSpec[]
  details: string
  reviews: ProductReview[]
}

/**
 * 商品规格接口
 */
export interface ProductSpec {
  id: number
  name: string
  options: SpecOption[]
}

/**
 * 规格选项接口
 */
export interface SpecOption {
  id: number
  name: string
  value: string
  price?: number
  stock?: number
}

/**
 * 商品评价接口
 */
export interface ProductReview {
  id: number
  userName: string
  avatar: string
  rating: number
  content: string
  images?: string[]
  createTime: string
}

/**
 * 分类接口
 */
export interface Category {
  id: number
  name: string
  products?: Product[]
  icon?: string
}

/**
 * 首页数据接口
 */
export interface HomeData {
  bannerList: string[]
  categoryList: Category[]
  activityBanner: string
  hotProducts: Product[]
  recommendProductNames: string[]
}

/**
 * 分类数据类型
 */
export type ClassifyData = Category[]

// 声明JSON模块
// User data types
export interface UserInfo {
  id: number
  name: string
  avatar: string
  level: string
  points: number
  coupons: number
  collections: number
  reviews: number
}

export interface MenuItem {
  id: number
  name: string
  icon: string
  color: string
  path: string
}

export interface OrderStatus {
  id: number
  name: string
  icon: string
  count: number
  path: string
  status: number
}

export interface ServiceItem {
  id: number
  name: string
  icon: string
  color: string
  path: string
}

export interface DiscoverProduct {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  tag?: string
  sales: number
}
// 用户数据类型
export interface UserData {
  userInfo: UserInfo
  menuItems: MenuItem[]
  orderStatus: OrderStatus[]
  serviceItems: ServiceItem[]
  discoverProducts: DiscoverProduct[]
}

// 订单相关类型
export interface OrderTab {
  id: string
  name: string
  count: number
}

export interface OrderItem {
  id: string
  name: string
  image: string
  color: string
  size: string
  price: number
  quantity: number
}

export interface OrderAction {
  text: string
  type: string
  primary?: boolean
}

export interface Order {
  id: string
  status: string
  statusText: string
  statusColor: string
  createTime: string
  totalAmount: number
  totalQuantity: number
  items: OrderItem[]
  actions: OrderAction[]
}

export interface OrderData {
  orderTabs: OrderTab[]
  orders: Order[]
}

declare module '*.json' {
  const value: any
  export default value
}

// 具体的JSON文件类型声明
declare module '@/static/data/home.json' {
  const homeData: HomeData
  export default homeData
}

declare module '@/static/data/classify.json' {
  const classifyData: ClassifyData
  export default classifyData
}
