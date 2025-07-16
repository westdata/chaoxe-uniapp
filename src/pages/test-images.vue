<template>
  <view class="test-page">
    <view class="header">
      <text class="title">图片显示测试</text>
    </view>
    
    <view class="section">
      <text class="section-title">轮播图 ({{ banners.length }}个)</text>
      <view class="image-grid">
        <view v-for="item in banners" :key="item.id" class="image-item">
          <image :src="item.image_url" mode="aspectFill" class="test-image"></image>
          <text class="image-title">{{ item.title }}</text>
        </view>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">环保成果 ({{ achievements.length }}个)</text>
      <view class="image-grid">
        <view v-for="item in achievements" :key="item.id" class="image-item">
          <image :src="item.thumbnail" mode="aspectFill" class="test-image"></image>
          <text class="image-title">{{ item.title }}</text>
        </view>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">办事服务 ({{ services.length }}个)</text>
      <view class="image-grid">
        <view v-for="item in services" :key="item.id" class="image-item">
          <image :src="item.thumbnail" mode="aspectFill" class="test-image"></image>
          <text class="image-title">{{ item.title }}</text>
        </view>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">环境管理要求 ({{ requirements.length }}个)</text>
      <view class="image-grid">
        <view v-for="item in requirements" :key="item.id" class="image-item">
          <image :src="item.thumbnail" mode="aspectFill" class="test-image"></image>
          <text class="image-title">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">志愿活动 ({{ volunteers.length }}个)</text>
      <view class="image-grid">
        <view v-for="item in volunteers" :key="item.id" class="image-item">
          <image :src="item.thumbnail" mode="aspectFill" class="test-image"></image>
          <text class="image-title">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">打卡地点 ({{ checkinSpots.length }}个)</text>
      <view class="image-grid">
        <view v-for="item in checkinSpots" :key="item.id" class="image-item">
          <image :src="item.thumbnail" mode="aspectFill" class="test-image"></image>
          <text class="image-title">{{ item.title }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      banners: [],
      achievements: [],
      services: [],
      requirements: [],
      volunteers: [],
      checkinSpots: []
    }
  },
  onLoad() {
    this.loadAllData()
  },
  methods: {
    async loadAllData() {
      try {
        // 加载轮播图
        const bannerResponse = await api.getActiveBanners(5)
        if (bannerResponse.success) {
          this.banners = bannerResponse.data
        }
        
        // 加载环保成果
        const achievementResponse = await api.getLatestAchievements(5)
        if (achievementResponse.success) {
          this.achievements = achievementResponse.data
        }
        
        // 加载办事服务
        const serviceResponse = await api.getServices({ page: 1, page_size: 10 })
        if (serviceResponse.success) {
          this.services = serviceResponse.data.items || []
        }
        
        // 加载环境管理要求
        const requirementResponse = await api.getEnvironmentalRequirements({ page: 1, page_size: 10 })
        if (requirementResponse.success) {
          this.requirements = requirementResponse.data.items || []
        }
        
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.section {
  margin-bottom: 40rpx;
  background-color: white;
  border-radius: 12rpx;
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  width: 200rpx;
  text-align: center;
}

.test-image {
  width: 200rpx;
  height: 150rpx;
  border-radius: 8rpx;
  background-color: #f0f0f0;
}

.image-title {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
