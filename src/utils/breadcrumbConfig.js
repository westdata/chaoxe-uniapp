// 面包屑配置工具
export default {
  // 页面路径到面包屑的映射配置
  pageConfig: {
    '/pages/service/service': [
      { title: '首页', path: '/pages/index/index' },
      { title: '我要办事', path: '' }
    ],
    '/pages/service/detail': [
      { title: '首页', path: '/pages/index/index' },
      { title: '我要办事', path: '/pages/service/service' },
      { title: '服务详情', path: '' }
    ],
    '/pages/environmental/environmental': [
      { title: '首页', path: '/pages/index/index' },
      { title: '日常环境管理', path: '' }
    ],
    '/pages/environmental/daily': [
      { title: '首页', path: '/pages/index/index' },
      { title: '日常环境管理', path: '/pages/environmental/environmental' },
      { title: '管理要求', path: '' }
    ],
    '/pages/environmental/requirements': [
      { title: '首页', path: '/pages/index/index' },
      { title: '日常环境管理', path: '/pages/environmental/environmental' },
      { title: '环保要求', path: '' }
    ],
    '/pages/activity/activity': [
      { title: '首页', path: '/pages/index/index' },
      { title: '我要参加', path: '' }
    ],
    '/pages/message/message': [
      { title: '首页', path: '/pages/index/index' },
      { title: '留言', path: '' }
    ],
    '/pages/chatbot/chatbot': [
      { title: '首页', path: '/pages/index/index' },
      { title: '朝小e', path: '' }
    ],
    '/pages/webview/webview': [
      { title: '首页', path: '/pages/index/index' },
      { title: '详情', path: '' }
    ]
  },

  // 获取当前页面的面包屑配置
  getBreadcrumbs(currentPath, customTitle = null) {
    const config = this.pageConfig[currentPath] || []
    
    // 如果提供了自定义标题，更新最后一项的标题
    if (customTitle && config.length > 0) {
      const newConfig = [...config]
      newConfig[newConfig.length - 1] = {
        ...newConfig[newConfig.length - 1],
        title: customTitle
      }
      return newConfig
    }
    
    return config
  },

  // 动态添加面包屑配置
  addPageConfig(path, breadcrumbs) {
    this.pageConfig[path] = breadcrumbs
  }
}