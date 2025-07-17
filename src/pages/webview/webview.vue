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
      <web-view 
        v-if="webviewUrl && !error"
        :src="webviewUrl"
        @message="onMessage"
        @error="onError"
        @load="onLoad"
        style="width: 100%; height: 100%;"
      ></web-view>
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
      headerHeight: '88rpx'
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
  overflow: hidden;
  z-index: 100;
}

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
