// 面包屑混入
import breadcrumbConfig from '@/utils/breadcrumbConfig.js'

export default {
  data() {
    return {
      breadcrumbItems: []
    }
  },
  
  onLoad(options) {
    // 获取当前页面路径
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentPath = '/' + currentPage.route
    
    // 从URL参数中获取自定义标题
    const customTitle = options.title ? decodeURIComponent(options.title) : null
    
    // 设置面包屑
    this.breadcrumbItems = breadcrumbConfig.getBreadcrumbs(currentPath, customTitle)
  },
  
  methods: {
    // 手动设置面包屑（用于动态页面）
    setBreadcrumbs(breadcrumbs) {
      this.breadcrumbItems = breadcrumbs
    },
    
    // 添加面包屑项
    addBreadcrumb(item) {
      this.breadcrumbItems.push(item)
    }
  }
}