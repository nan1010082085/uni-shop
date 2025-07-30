export {}

// 声明 uni.$u 实例
// 参考 https://uview-next.netlify.app/js/fastUse.html
interface UViewInstance {
  // 平台信息
  platform: string
  // 判断 ios
  os: () => 'ios' | 'android';
  // 此方法用于获取设备的信息，相当于uni.getSystemInfoSync()的效果
  sys: () => string
  http: any
  // 去空格
  trim: any
  // 显示消息提示框
  toast: (message: string, options?: any) => void
  // 其他
  [k: string]: any
}

declare global {
  interface Uni {
    $u: UViewInstance
  }
}

declare module 'vue' {
  type Hooks = App.AppInstance & Page.PageInstance
  interface ComponentCustomOptions extends Hooks {}
}
