<template>
  <view class="index-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-title">首页</view>
    </view>

    <!-- 轮播图 -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        :style="{ height: swiperHeight + 'rpx' }"
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="500"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#FFFFFF"
      >
        <swiper-item v-for="(banner, index) in bannerList" :key="index">
          <view class="banner-item" @click="onBannerClick(banner)">
            <image
              class="banner-image"
              :src="getBannerImageUrl(banner.image_url)"
              mode="aspectFit"
              @error="onImageError($event, 'banner')"
              @load="onBannerImageLoad"
            ></image>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 功能按钮 -->
    <view class="function-section">
      <view class="function-grid">
        <view class="function-item" @click="navigateTo('/pages/service/service')">
          <view class="function-icon red">
            <image class="icon-image" src="@/static/icons/我要办事.png" mode="aspectFit"></image>
          </view>
          <text class="function-name">我要办事</text>
        </view>
        <view class="function-item" @click="navigateTo('/pages/message/message')">
          <view class="function-icon blue">
            <image class="icon-image" src="@/static/icons/我要留言.png" mode="aspectFit"></image>
          </view>
          <text class="function-name">我要留言</text>
        </view>
        <view class="function-item" @click="navigateTo('/pages/activity/activity')">
          <view class="function-icon orange">
            <image class="icon-image" src="@/static/icons/我要参加.png" mode="aspectFit"></image>
          </view>
          <text class="function-name">我要参加</text>
        </view>
        <view class="function-item" @click="navigateTo('/pages/chatbot/chatbot')">
          <view class="function-icon purple">
            <image class="icon-image" src="@/static/icons/朝小e助手.png" mode="aspectFit"></image>
          </view>
          <text class="function-name">朝小e助手</text>
        </view>
      </view>
    </view>

    <!-- 生态环保成果展示 -->
    <view class="achievement-section">
      <view class="section-title">生态环保成果展</view>
      <view class="achievement-list">
        <view
          class="achievement-item"
          v-for="item in achievementList"
          :key="item.id"
          @click="viewAchievement(item)"
        >
          <view class="achievement-content">
            <view class="achievement-title">{{ item.title }}</view>
            <view class="achievement-description">{{ item.description }}</view>
            <view class="achievement-meta">
              <view class="achievement-date">{{ formatDate(item.published_at) }}</view>
            </view>
          </view>
          <view class="achievement-image">
            <image
              :src="getAchievementImageUrl(item.image_url || item.thumbnail)"
              mode="aspectFill"
              @error="onImageError($event, 'achievement')"
            ></image>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航指示器 -->
    <view class="bottom-indicator">
      <view class="indicator-line"></view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import navigation from '@/utils/navigation.js'
import imageUtils from '@/utils/imageUtils.js'

export default {
  data() {
    return {
      bannerList: [],
      achievementList: [],
      loadingBanners: true,
      loadingAchievements: true,
      swiperHeight: 400, // 默认高度，防止闪烁
      isSwiperHeightCalculated: false
    }
  },
  onLoad() {
    this.loadBanners()
    this.loadAchievements()
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    onBannerImageLoad(e) {
      if (this.isSwiperHeightCalculated) {
        return
      }
      // 首次加载时，计算swiper高度
      const { width, height } = e.detail
      const screenWidth = uni.getSystemInfoSync().windowWidth
      const marginInPx = 60 * (screenWidth / 750) // 左右边距共60rpx
      const swiperWidth = screenWidth - marginInPx
      const newHeightInPx = (swiperWidth * height) / width
      const newHeightInRpx = newHeightInPx * (750 / screenWidth)

      this.swiperHeight = newHeightInRpx
      this.isSwiperHeightCalculated = true
    },
    async loadBanners() {
      try {
        this.loadingBanners = true
        const response = await api.getActiveBanners(5)

        if (response.success && response.data && response.data.length > 0) {
          // 处理API返回的数据，确保字段映射正确
          this.bannerList = response.data.map(item => ({
            id: item.id,
            title: item.title,
            subtitle: '朝阳环保 · 绿色发展',
            image_url: item.image_url, // API已经处理过图片URL
            link_url: item.link_url || ''
          }))
        } else {
          // 如果没有数据，显示默认内容
          this.bannerList = [{
            id: 'default',
            title: '朝阳环保App',
            subtitle: '绿色发展 · 美丽朝阳',
            image_url: '/static/banner-default.jpg',
            link_url: ''
          }]
        }
      } catch (error) {
        console.error('加载轮播图失败:', error)
        // API失败时显示默认内容
        this.bannerList = [{
          id: 'default',
          title: '朝阳环保App',
          subtitle: '绿色发展 · 美丽朝阳',
          image_url: '/static/banner-default.jpg',
          link_url: ''
        }]
        uni.showToast({
          title: '轮播图加载失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loadingBanners = false
      }
    },
    async loadAchievements() {
      try {
        this.loadingAchievements = true
        const response = await api.getLatestAchievements(5)

        if (response.success && response.data && response.data.length > 0) {
          // 处理API返回的数据，确保字段映射正确
          this.achievementList = response.data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.summary || item.description || '暂无描述',
            published_at: item.publish_time || item.created_at,
            image_url: item.thumbnail, // API已经处理过图片URL
            view_count: item.view_count || 0,
            external_url: item.external_url || ''
          }))
        } else {
          // 如果没有数据，显示默认内容
          this.achievementList = [{
            id: 'default',
            title: '朝阳区空气质量持续改善',
            description: '2024年朝阳区PM2.5年均浓度同比下降15%，环境质量显著提升',
            published_at: new Date().toISOString(),
            image_url: '/static/achievement-default.jpg',
            view_count: 1250,
            external_url: ''
          }, {
            id: 'default-2',
            title: '绿色发展成效显著',
            description: '新增绿化面积500万平方米，建成生态公园15个',
            published_at: new Date().toISOString(),
            image_url: '/static/achievement-default.jpg',
            view_count: 890,
            external_url: ''
          }]
        }
      } catch (error) {
        console.error('加载环保成果失败:', error)
        // API失败时显示默认内容
        this.achievementList = [{
          id: 'default',
          title: '朝阳区空气质量持续改善',
          description: '2024年朝阳区PM2.5年均浓度同比下降15%，环境质量显著提升',
          published_at: new Date().toISOString(),
          image_url: '/static/achievement-default.jpg',
          view_count: 1250,
          external_url: ''
        }, {
          id: 'default-2',
          title: '绿色发展成效显著',
          description: '新增绿化面积500万平方米，建成生态公园15个',
          published_at: new Date().toISOString(),
          image_url: '/static/achievement-default.jpg',
          view_count: 890,
          external_url: ''
        }]
        uni.showToast({
          title: '环保成果加载失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loadingAchievements = false
      }
    },
    navigateTo(path) {
      navigation.navigateTo(path)
    },
    onBannerClick(banner) {
      if (banner.link_url) {
        if (banner.link_url.startsWith('http')) {
          // #ifdef H5
          // H5端浏览器中打开
          window.open(banner.link_url, '_blank')
          // #endif

          // #ifdef APP-PLUS
          // App端调用系统浏览器打开
          uni.openURL({
            url: banner.link_url
          })
          // #endif

          // #ifdef MP-WEIXIN
          // 微信小程序端，提示并复制链接
          uni.showModal({
            title: '外部链接提示',
            content: '即将打开的链接无法在小程序内直接访问，已为您复制链接，请在浏览器中打开。',
            confirmText: '复制链接',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                uni.setClipboardData({
                  data: banner.link_url,
                  success: () => {
                    uni.showToast({
                      title: '链接已复制'
                    })
                  }
                })
              }
            }
          })
          // #endif
        } else {
          // 对于内部链接，正常跳转
          uni.navigateTo({
            url: banner.link_url
          })
        }
      }
    },

    // 图片处理方法
    getBannerImageUrl(imageUrl) {
      return imageUtils.getBannerImageUrl(imageUrl)
    },

    getAchievementImageUrl(imageUrl) {
      return imageUtils.getAchievementImageUrl(imageUrl)
    },

    onImageError(event, type = 'default') {
      return imageUtils.handleImageError(event, type)
    },
    viewAchievement(item) {
      if (item.external_url && item.external_url.startsWith('http')) {
        // #ifdef MP-WEIXIN
        // 微信小程序端，在webview中打开
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(item.external_url)}`
        })
        // #endif

        // #ifdef APP-PLUS
        // App端调用系统浏览器打开
        uni.openURL({
          url: item.external_url
        })
        // #endif

        // #ifdef H5
        // H5端浏览器中打开
        window.open(item.external_url, '_blank')
        // #endif
      } else {
        // 如果没有外部链接，可以保留旧的弹窗逻辑或者不做任何事
        uni.showModal({
          title: item.title,
          content: item.description,
          showCancel: false
        })
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    },

    async refreshData() {
      try {
        await Promise.all([
          this.loadBanners(),
          this.loadAchievements()
        ])

        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        })
      } catch (error) {
        console.error('刷新失败:', error)
        uni.showToast({
          title: '刷新失败',
          icon: 'none',
          duration: 1500
        })
      } finally {
        uni.stopPullDownRefresh()
      }
    }
  }
}
</script>

<style scoped>
.index-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8c8dc 0%, #fde8e8 40%, #f5f5dc 80%, #f0f0e8 100%);
}

/* 页面标题 */
.page-header {
  height: 88rpx;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid rgba(240, 240, 240, 0.3);
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

/* 轮播图 */
.banner-section {
  margin: 30rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.banner-swiper {
  /* height: 400rpx; */
}

.banner-item {
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* 功能按钮 */
.function-section {
  margin: 30rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40rpx;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.function-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.function-icon.red {
  background: linear-gradient(135deg, #FE2741 0%, #FF4757 100%);
}

.function-icon.blue {
  background: linear-gradient(135deg, #4A90E2 0%, #5BA7F7 100%);
}

.function-icon.orange {
  background: linear-gradient(135deg, #FFC533 0%, #FFD700 100%);
}

.function-icon.purple {
  background: linear-gradient(135deg, #9B59B6 0%, #BB6BD9 100%);
}

.icon-image {
  width: 60rpx;
  height: 60rpx;
}

.function-name {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
}

/* 生态环保成果展示 */
.achievement-section {
  margin: 30rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 30rpx;
  text-align: center;
}

.achievement-list {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #F8F8F8;
}

.achievement-item:last-child {
  border-bottom: none;
}

.achievement-content {
  flex: 1;
  margin-right: 30rpx;
}

.achievement-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.achievement-description {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.achievement-meta {
  display: flex;
  align-items: center;
}

.achievement-date {
  font-size: 24rpx;
  color: #999999;
}



.achievement-image {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.achievement-image image {
  width: 100%;
  height: 100%;
}

/* 底部导航指示器 */
.bottom-indicator {
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.indicator-line {
  width: 268rpx;
  height: 8rpx;
  background-color: #333333;
  border-radius: 4rpx;
}
</style>
