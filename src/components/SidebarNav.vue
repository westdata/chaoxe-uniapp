<template>
  <view class="sidebar-nav">
    <view class="nav-item" @click="goHome">
      <image class="nav-icon-img" :src="homeIcon" mode="aspectFit"></image>
      <text class="nav-text">返回首页</text>
    </view>
    <view class="nav-divider"></view>
    <view class="nav-item active" @click="goToCustomerService">
      <image class="nav-icon-img" :src="chaoxiaoEIcon" mode="aspectFit" @error="onImageError"></image>
      <text class="nav-text">朝小e</text>
    </view>
  </view>
</template>

<script>
import homeIcon from '@/static/icons/房子.png'
import chaoxiaoEIcon from '@/static/icons/white/朝小易红.png'

export default {
  name: 'SidebarNav',
  data() {
    return {
      homeIcon,
      chaoxiaoEIcon
    }
  },
  methods: {
    goHome() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    },
    goToCustomerService() {
      uni.navigateTo({
        url: '/pages/chatbot/chatbot'
      })
    },
    onImageError(e) {
      console.error('图片加载失败:', e)
      uni.showToast({
        title: '图标加载失败',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.sidebar-nav {
  position: fixed;
  left: 0;
  bottom: 300rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #FFFFFF;
  border-radius: 0 40rpx 40rpx 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding-left: 10rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  transform: scale(1.05);
}

.nav-divider {
  width: 1rpx;
  height: 70rpx;
  background-color: #C9CCD3;
  margin: 0 10rpx;
}

.nav-item.active .nav-icon {
  color: #FE2741;
}

.nav-item.active .nav-text {
  color: #FE2741;
}

.nav-icon {
  font-size: 28rpx;
  margin-bottom: 4rpx;
}

.nav-icon-img {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 4rpx;
}

.nav-text {
  font-size: 18rpx;
  color: #999999;
  text-align: center;
  white-space: nowrap;
}
</style>
