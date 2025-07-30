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