<template>
  <view class="webview-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goHome">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">{{ pageTitle }}</view>
      <view class="header-right"></view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-content">
        <view class="loading-icon">🌐</view>
        <text class="loading-text">页面加载中...</text>
      </view>
    </view>

    <!-- 固定定位的WebView容器，样式内联确保应用 -->
    <view class="webview-wrapper" :style="{ top: '88rpx', height: 'calc(100vh - 88rpx)' }">
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
    ></iframe>
    <!-- #endif -->

    <!-- 非H5平台(如小程序): 使用web-view -->
    <!-- #ifndef H5 -->
    <web-view
      v-if="webviewUrl && !error"
      :src="webviewUrl"
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

export default {
  data() {
    return {
      webviewUrl: '',
      loading: true,
      error: '',
      pageTitle: '详情',
      // 明确设置高度值，确保在所有环境中一致
      headerHeight: '88rpx',
      // webview样式配置
      webviewStyles: {
        progress: {
          color: '#FE2741'
        },
        // 启用滚动
        scrollEnabled: true,
        // 启用缩放
        scalesPageToFit: true,
        // 启用用户交互
        userInteractionEnabled: true,
        // 允许内联播放
        allowsInlineMediaPlayback: true,
        // 允许AirPlay
        allowsAirPlayForMediaPlayback: true,
        // 允许图片保存
        allowsPictureInPictureMediaPlayback: true
      }
    }
  },
  onLoad(options) {
    let externalUrl = options.url ? decodeURIComponent(options.url) : null
    this.pageTitle = options.title ? decodeURIComponent(options.title) : '详情'

    if (externalUrl) {
      // 添加时间戳参数，防止缓存
      if (externalUrl.includes('?')) {
        externalUrl += `&t=${Date.now()}`
      } else {
        externalUrl += `?t=${Date.now()}`
      }
      
      this.webviewUrl = externalUrl
      // loading 会在 onLoad 事件中设置为 false
    } else {
      this.error = '无效的页面地址，无法加载页面。'
      this.loading = false
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
      console.log('WebView消息:', event.detail.data)
      // 处理来自WebView的消息
      const data = event.detail.data
      if (data && data.length > 0) {
        const message = data[0]
        // 处理页面标题更新
        if (message.type === 'title' && message.title) {
          this.pageTitle = message.title
        }
        // 处理链接跳转请求
        if (message.type === 'navigate' && message.url) {
          this.handleNavigation(message.url)
        }
      }
    },
    // 处理导航请求
    handleNavigation(url) {
      // 如果是外部链接，在新的webview中打开
      if (url.startsWith('http://') || url.startsWith('https://')) {
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent('外部链接')}`
        })
      }
    },
    onError(event) {
      console.error('WebView错误:', event.detail)
      this.error = '无法加载此页面，请检查链接是否正确或稍后重试。'
      this.loading = false
    },
    onLoad(event) {
      console.log('WebView加载完成:', event.detail)
      this.loading = false
    }
  }
}
</script>

<style scoped>
.webview-page {
  height: 100vh;
  width: 100%;
  background-image: url('../../../photo/服务事项/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
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

/* WebView包装器样式 */
.webview-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  /* 移除overflow: hidden，允许内容滚动 */
  overflow: visible;
  z-index: 100;
}

/* H5平台iframe样式 */
/* #ifdef H5 */
.webview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  /* 确保iframe可以滚动 */
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
/* #endif */

/* 非H5平台web-view样式优化 */
/* #ifndef H5 */
web-view {
  width: 100%;
  height: 100%;
  /* 确保webview可以滚动 */
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
/* #endif */

.loading-container,
.error-container {
  position: fixed;
  top: 88rpx;
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
