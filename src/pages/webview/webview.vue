<template>
  <view class="webview-page">
    <!-- 背景图片 -->
    <image class="background-image" src="/photo/服务事项/image.png" mode="aspectFill"></image>
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goHome">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">{{ pageTitle }}</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 面包屑导航区域 -->
    <view class="breadcrumb-area">
      <Breadcrumb :items="breadcrumbItems" />
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-content">
        <view class="loading-icon">🌐</view>
        <text class="loading-text">页面加载中...</text>
      </view>
    </view>

    <!-- 固定定位的WebView容器，样式内联确保应用 -->
    <view class="webview-wrapper" :style="{ top: '200rpx', height: 'calc(100vh - 200rpx)' }">
    <!-- H5平台: 使用iframe并赋予权限 -->
    <!-- #ifdef H5 -->
    <iframe
      v-if="webviewUrl && !error"
      :src="webviewUrl"
      @error="onError"
      @load="onLoad"
      frameborder="0"
      allow="microphone; camera; geolocation; autoplay; encrypted-media; fullscreen"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-pointer-lock"
      class="webview-iframe"
      ref="webviewIframe"
    ></iframe>
    <!-- #endif -->

    <!-- 非H5平台(如小程序): 使用web-view -->
    <!-- #ifndef H5 -->
    <web-view
      v-if="webviewUrl && !error"
      :src="adaptiveWebviewUrl"
      @message="onMessage"
      @error="onError"
      @load="onLoad"
      :webview-styles="webviewStyles"
      :update-title="true"
      style="width: 100%; height: 100%;"
    ></web-view>
    <!-- #endif -->
    </view>

    <!-- 错误状态 -->
    <view class="error-container" v-if="error">
      <view class="error-content">
        <view class="error-icon">❌</view>
        <text class="error-text">{{ error }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import webviewBridge from '@/utils/webview-bridge.js'
import Breadcrumb from '@/components/Breadcrumb.vue'

export default {
  components: {
    Breadcrumb
  },
  data() {
    return {
      webviewUrl: '',
      adaptiveWebviewUrl: '',
      loading: true,
      error: '',
      pageTitle: '详情',
      breadcrumbItems: [],
      // 明确设置高度值，确保在所有环境中一致
      headerHeight: '88rpx',
      // webview样式配置
      webviewStyles: webviewBridge.getWebviewStyles()
    }
  },
  onLoad(options) {
    console.log('WebView onLoad options:', options)
    let externalUrl = options.url ? decodeURIComponent(options.url) : null
    this.pageTitle = options.title ? decodeURIComponent(options.title) : '详情'
    
    console.log('WebView页面信息:', {
      externalUrl,
      pageTitle: this.pageTitle,
      from: options.from,
      fromTitle: options.fromTitle
    })
    
    // 设置面包屑
    console.log('准备设置面包屑...')
    this.setupBreadcrumb(options)
    console.log('面包屑设置完成，当前breadcrumbItems:', this.breadcrumbItems)

    if (externalUrl) {
      // 添加时间戳参数，防止缓存
      if (externalUrl.includes('?')) {
        externalUrl += `&t=${Date.now()}`
      } else {
        externalUrl += `?t=${Date.now()}`
      }
      
      this.webviewUrl = externalUrl
      
      // 对于小程序环境，使用自适应URL
      // #ifndef H5
      this.adaptiveWebviewUrl = this.getAdaptiveUrl(externalUrl)
      // #endif
      
      // #ifdef H5
      this.adaptiveWebviewUrl = externalUrl
      // #endif
      
      // loading 会在 onLoad 事件中设置为 false
    } else {
      this.error = '无效的页面地址，无法加载页面。'
      this.loading = false
    }
  },
  watch: {
    breadcrumbItems: {
      handler(newVal, oldVal) {
        console.log('WebView breadcrumbItems 变化:', {
          oldVal,
          newVal,
          newValLength: newVal ? newVal.length : 'undefined'
        })
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    goHome() {
      // 优先返回上一页
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }
    },
    onMessage(event) {
      webviewBridge.handleMessage(event, this)
    },
    // 处理导航请求
    handleNavigation(url) {
      webviewBridge.handleNavigation(url, this)
    },
    onError(event) {
      console.error('WebView加载错误:', event)
      // 如果是域名不在白名单的错误，显示友好提示
      if (event.detail && event.detail.errMsg && event.detail.errMsg.includes('not in domain list')) {
        this.error = '该网页域名未在小程序业务域名白名单中，请联系管理员配置域名或在微信开发者工具中关闭域名校验。'
      } else {
        webviewBridge.handleError(event, this)
      }
    },
    onLoad(event) {
      console.log('WebView加载完成:', event.detail)
      this.loading = false
      
      // 在H5环境下，为iframe注入自适应脚本
      // #ifdef H5
      this.$nextTick(() => {
        this.injectScaleScript()
      })
      // #endif
    },
    
    // 为H5环境的iframe注入自适应脚本
    injectScaleScript() {
      // 跨域iframe无法注入脚本，这是浏览器的安全限制
      // 对于外部网站，我们无法控制其内容，所以跳过脚本注入
      console.log('跳过iframe脚本注入（跨域限制）')
    },
    
    // 设置面包屑导航
    setupBreadcrumb(options) {
      // 获取来源页面信息
      const fromPage = options.from || ''
      const fromTitle = options.fromTitle ? decodeURIComponent(options.fromTitle) : ''
      
      // 默认面包屑
      let breadcrumbs = [
        { title: '首页', path: '/pages/index/index' }
      ]
      
      // 根据来源页面添加中间层级
      if (fromPage === 'service') {
        breadcrumbs.push({ title: '我要办事', path: '/pages/service/service' })
      } else if (fromPage === 'environmental') {
        breadcrumbs.push({ title: '日常环境管理', path: '/pages/environmental/environmental' })
      } else if (fromPage === 'activity') {
        breadcrumbs.push({ title: '我要参加', path: '/pages/activity/activity' })
      } else if (fromPage === 'daily') {
        breadcrumbs.push({ title: '日常环境管理', path: '/pages/environmental/environmental' })
        breadcrumbs.push({ title: '管理要求', path: '/pages/environmental/daily' })
      }
      
      // 添加当前页面（使用页面标题）
      breadcrumbs.push({ title: this.pageTitle, path: '' })
      
      this.breadcrumbItems = breadcrumbs
      
      console.log('WebView面包屑设置:', {
        fromPage,
        fromTitle,
        pageTitle: this.pageTitle,
        breadcrumbs: this.breadcrumbItems
      })
    },
    
    // 获取添加了自适应脚本的URL
    getAdaptiveUrl(url) {
      // 如果URL已经包含自适应脚本，直接返回
      if (url.includes('adaptive=true')) {
        return url
      }
      
      // 在小程序环境中，我们使用中间页面来实现自适应缩放
      // #ifdef MP-WEIXIN
      // 获取当前小程序页面路径，用于构建中间页面的路径
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const basePath = currentPage.route.split('/').slice(0, -1).join('/')
      
      // 构建中间页面的完整路径
      // 注意：小程序中的web-view只能加载https或wss协议的网页
      // 如果是本地HTML文件，需要先部署到可访问的HTTPS服务器上
      
      // 方案1: 如果中间页面已经部署到服务器上
      // return `https://your-domain.com/adaptive-wrapper.html?url=${encodeURIComponent(url)}`
      
      // 方案2: 如果目标网站支持接收参数并自行处理缩放
      return `${url}${url.includes('?') ? '&' : '?'}adaptive=true&scale=auto`
      // #endif
      
      // 在APP环境中，我们可以使用本地HTML文件作为中间页
      // #ifdef APP-PLUS
      // 获取应用资源目录
      const adaptiveWrapperPath = '_www/hybrid/html/adaptive-wrapper.html'
      return `file://${adaptiveWrapperPath}?url=${encodeURIComponent(url)}`
      // #endif
      
      // 在其他环境中，直接返回原始URL
      return url
    }
  }
}
</script>

<style scoped>
.webview-page {
  height: 100vh;
  width: 100%;
  position: relative;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx; /* 导航栏高度 */
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  padding: 0 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
  z-index: 1000;
}

.header-left {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: #333333;
  font-weight: 300;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.header-right {
  width: 80rpx;
}

.breadcrumb-area {
  position: fixed;
  top: 88rpx;
  left: 0;
  right: 0;
  z-index: 999;
  background: transparent;
  padding-top: 10rpx;
}

/* WebView包装器样式 */
.webview-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  /* 允许竖向滚动，但禁止横向滚动 */
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
}

/* H5平台iframe样式 */
/* #ifdef H5 */
.webview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  /* 允许竖向滚动，但禁止横向滚动 */
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
/* #endif */

/* 非H5平台web-view样式优化 */
/* #ifndef H5 */
web-view {
  width: 100%;
  height: 100%;
  /* 确保webview可以滚动 */
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
/* #endif */

.loading-container,
.error-container {
  position: fixed;
  top: 200rpx;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  z-index: 101;
}

.loading-content,
.error-content {
  text-align: center;
}

.loading-icon,
.error-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.loading-text,
.error-text {
  font-size: 32rpx;
  color: #666666;
  margin-bottom: 40rpx;
  line-height: 1.6;
}
</style>
