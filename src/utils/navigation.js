// 导航工具类
class NavigationService {
  constructor() {
    // 页面路径配置
    this.routes = {
      // 主要页面
      home: '/pages/index/index',
      service: '/pages/service/service',
      message: '/pages/message/message',
      activity: '/pages/activity/activity',
      webview: '/pages/webview/webview',
      environmental: '/pages/environmental/environmental'
    }
  }

  // 跳转到指定页面
  navigateTo(path, params = {}) {
    let url = path
    
    // 如果是路由名称，转换为实际路径
    if (this.routes[path]) {
      url = this.routes[path]
    }
    
    // 添加参数
    if (Object.keys(params).length > 0) {
      const query = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      url += `?${query}`
    }
    
    uni.navigateTo({
      url,
      fail: (error) => {
        console.error('页面跳转失败:', error)
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  }

  // 替换当前页面
  redirectTo(path, params = {}) {
    let url = path
    
    if (this.routes[path]) {
      url = this.routes[path]
    }
    
    if (Object.keys(params).length > 0) {
      const query = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      url += `?${query}`
    }
    
    uni.redirectTo({
      url,
      fail: (error) => {
        console.error('页面重定向失败:', error)
      }
    })
  }

  // 重新加载当前页面
  reLaunch(path, params = {}) {
    let url = path
    
    if (this.routes[path]) {
      url = this.routes[path]
    }
    
    if (Object.keys(params).length > 0) {
      const query = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      url += `?${query}`
    }
    
    uni.reLaunch({
      url,
      fail: (error) => {
        console.error('页面重新加载失败:', error)
      }
    })
  }

  // 切换到Tab页面
  switchTab(path) {
    let url = path
    
    if (this.routes[path]) {
      url = this.routes[path]
    }
    
    uni.switchTab({
      url,
      fail: (error) => {
        console.error('Tab切换失败:', error)
      }
    })
  }

  // 返回上一页
  navigateBack(delta = 1) {
    const pages = getCurrentPages()
    if (pages.length > delta) {
      uni.navigateBack({
        delta,
        fail: (error) => {
          console.error('返回失败:', error)
          // 如果返回失败，跳转到首页
          this.reLaunch('home')
        }
      })
    } else {
      // 如果没有足够的历史页面，跳转到首页
      console.log('没有足够的历史页面，跳转到首页')
      this.reLaunch('home')
    }
  }

  // 安全返回方法（推荐使用）
  safeGoBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack({
        fail: () => {
          // 如果返回失败，跳转到首页
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }
      })
    } else {
      // 如果没有历史页面，跳转到首页
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  }

  // 跳转到外部链接
  navigateToWebView(url, title = '网页') {
    this.navigateTo('webview', {
      url: encodeURIComponent(url),
      title
    })
  }

  // 跳转到服务详情
  navigateToServiceDetail(serviceId) {
    this.navigateTo('service', {
      id: serviceId,
      action: 'detail'
    })
  }

  // 跳转到环境管理详情
  navigateToEnvironmentalDetail(requirementId) {
    this.navigateTo('environmental', {
      id: requirementId,
      action: 'detail'
    })
  }



  // 跳转到留言页面（带预填信息）
  navigateToMessage(preData = {}) {
    this.navigateTo('message', preData)
  }

  // 获取当前页面路径
  getCurrentPath() {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      return '/' + pages[pages.length - 1].route
    }
    return ''
  }

  // 检查是否为首页
  isHomePage() {
    return this.getCurrentPath() === this.routes.home
  }

  // 检查是否为Tab页面
  isTabPage(path = null) {
    const currentPath = path || this.getCurrentPath()
    const tabPages = [this.routes.home, this.routes.service]
    return tabPages.includes(currentPath)
  }
}

// 创建导航实例
const navigation = new NavigationService()

// 导出导航实例
export default navigation

// 也可以导出具体的方法供直接使用
export const {
  navigateTo,
  redirectTo,
  reLaunch,
  switchTab,
  navigateBack,
  safeGoBack,
  navigateToWebView,
  navigateToServiceDetail,
  navigateToEnvironmentalDetail,
  navigateToMessage,
  getCurrentPath,
  isHomePage,
  isTabPage
} = navigation
