<template>
  <view class="test-page">
    <!-- 侧边栏导航 -->
    <SidebarNav />

    <view class="header">
      <text class="title">API接口测试</text>
    </view>
    
    <view class="content">
      <view class="test-section">
        <text class="section-title">基础配置</text>
        <view class="info-item">
          <text class="label">API Base URL:</text>
          <text class="value">{{ apiBaseUrl }}</text>
        </view>
      </view>

      <view class="test-section">
        <text class="section-title">接口测试结果</text>
        
        <view class="api-item" v-for="(result, index) in testResults" :key="index">
          <view class="api-header">
            <text class="api-name">{{ result.name }}</text>
            <text class="api-status" :class="result.success ? 'success' : 'error'">
              {{ result.success ? '✓' : '✗' }}
            </text>
          </view>
          <text class="api-url">{{ result.url }}</text>
          <text class="api-message" :class="result.success ? 'success' : 'error'">
            {{ result.message }}
          </text>
          <view v-if="result.data" class="api-data">
            <text class="data-label">返回数据:</text>
            <text class="data-content">{{ JSON.stringify(result.data, null, 2) }}</text>
          </view>
        </view>
      </view>

      <view class="actions">
        <button class="test-btn" @click="runAllTests" :disabled="testing">
          {{ testing ? '测试中...' : '开始测试' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      testing: false,
      apiBaseUrl: '',
      testResults: []
    }
  },
  onLoad() {
    // 获取API基础URL
    this.apiBaseUrl = api.baseUrl || '未知'
    this.runAllTests()
  },
  methods: {
    async runAllTests() {
      this.testing = true
      this.testResults = []
      
      const tests = [
        {
          name: '系统健康检查',
          method: () => api.getSystemHealth(),
          url: '/api/v1/system/health'
        },
        {
          name: '轮播图列表',
          method: () => api.getActiveBanners(3),
          url: '/api/v1/banners/active/list'
        },
        {
          name: '环保成果列表',
          method: () => api.getLatestAchievements(3),
          url: '/api/v1/achievements/published/latest'
        },
        {
          name: '志愿活动列表',
          method: () => api.getVolunteerActivities({ page: 1, page_size: 3 }),
          url: '/api/v1/volunteer-activities/'
        },
        {
          name: '服务项目列表',
          method: () => api.getServices({ page: 1, page_size: 3 }),
          url: '/api/v1/services/'
        },
        {
          name: '热门打卡地点',
          method: () => api.getPopularSpots(3),
          url: '/api/v1/checkin-spots/popular/list'
        },
        {
          name: '打卡地点列表',
          method: () => api.getCheckinSpots({ page: 1, page_size: 3 }),
          url: '/api/v1/checkin-spots/'
        }
      ]

      for (const test of tests) {
        try {
          console.log(`测试: ${test.name}`)
          const response = await test.method()
          
          this.testResults.push({
            name: test.name,
            url: test.url,
            success: response.success,
            message: response.message || '请求成功',
            data: response.success ? (response.data || null) : null
          })
        } catch (error) {
          console.error(`测试失败: ${test.name}`, error)
          this.testResults.push({
            name: test.name,
            url: test.url,
            success: false,
            message: error.message || '请求失败',
            data: null
          })
        }
        
        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      this.testing = false
    }
  }
}
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8c8dc 0%, #fde8e8 40%, #f5f5dc 80%, #f0f0e8 100%);
  padding: 20rpx;
}

.header {
  background: white;
  padding: 30rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.content {
  background: white;
  border-radius: 12rpx;
  padding: 30rpx;
}

.test-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.info-item {
  display: flex;
  margin-bottom: 10rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  width: 200rpx;
}

.value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.api-item {
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.api-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.api-status {
  font-size: 32rpx;
  font-weight: bold;
}

.api-status.success {
  color: #4CAF50;
}

.api-status.error {
  color: #F44336;
}

.api-url {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.api-message {
  font-size: 26rpx;
  margin-bottom: 10rpx;
  display: block;
}

.api-message.success {
  color: #4CAF50;
}

.api-message.error {
  color: #F44336;
}

.api-data {
  background: #f8f8f8;
  padding: 15rpx;
  border-radius: 6rpx;
  margin-top: 10rpx;
}

.data-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.data-content {
  font-size: 22rpx;
  color: #333;
  font-family: monospace;
  white-space: pre-wrap;
  display: block;
}

.actions {
  text-align: center;
  margin-top: 40rpx;
}

.test-btn {
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

.test-btn:disabled {
  background: #ccc;
}
</style>
