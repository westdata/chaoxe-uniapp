<template>
  <view class="webview-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">朝小e助手</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-content">
        <view class="loading-icon">🤖</view>
        <text class="loading-text">正在连接朝小e助手...</text>
      </view>
    </view>
    
    <!-- H5平台: 使用iframe并赋予权限 -->
    <!-- #ifdef H5 -->
    <iframe
      v-if="chatbotUrl && !loading"
      :src="chatbotUrl"
      @error="onError"
      @load="onLoad"
      frameborder="0"
      allow="microphone; autoplay"
      class="webview-iframe"
    ></iframe>
    <!-- #endif -->
    
    <!-- 非H5平台(如小程序): 仍然使用web-view -->
    <!-- #ifndef H5 -->
    <web-view 
      v-if="chatbotUrl && !loading"
      :src="chatbotUrl"
      @message="onMessage"
      @error="onError"
      @load="onLoad"
    ></web-view>
    <!-- #endif -->
    
    <!-- 错误状态 -->
    <view class="error-container" v-if="error">
      <view class="error-content">
        <view class="error-icon">❌</view>
        <text class="error-text">{{ error }}</text>
        <button class="retry-btn" @click="loadChatbot">重试</button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      chatbotUrl: '',
      loading: true,
      error: ''
    }
  },
  onLoad() {
    this.loadChatbot()
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    },
    async loadChatbot() {
      try {
        this.loading = true
        this.error = ''
        const response = await api.getChatbotUrl()
        if (response.success) {
          this.chatbotUrl = response.data.chatbot_url
        } else {
          throw new Error(response.message || '获取AI助手链接失败')
        }
      } catch (error) {
        console.error('加载AI助手失败:', error)
        this.error = error.message || '连接失败，请检查网络后重试'
      } finally {
        this.loading = false
      }
    },
    onMessage(event) {
      console.log('WebView消息:', event.detail.data)
    },
    onError(event) {
      console.error('WebView错误:', event)
      this.error = '页面加载失败，请重试'
      this.loading = false
    },
    onLoad(event) {
      console.log('WebView加载完成:', event)
      this.loading = false
    }
  }
}
</script>

<style scoped>
.webview-page {
  height: 100vh;
  background: linear-gradient(to bottom, #f8c8dc 0%, #fde8e8 40%, #f5f5dc 80%, #f0f0e8 100%);
  display: flex;
  flex-direction: column;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  padding: 0 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
  z-index: 1000;
  flex-shrink: 0;
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

.loading-container,
.error-container {
  position: absolute;
  top: 88rpx;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
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

.retry-btn {
  background: linear-gradient(135deg, #FE2741 0%, #FF4757 100%);
  color: #FFFFFF;
  border-radius: 50rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
  padding: 24rpx 48rpx;
}

/* #ifndef H5 */
web-view {
  position: absolute;
  top: 88rpx;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: calc(100vh - 88rpx);
}
/* #endif */

/* #ifdef H5 */
.webview-iframe {
  position: absolute;
  top: 88rpx;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: calc(100vh - 88rpx);
  border: none;
}
/* #endif */
</style> 