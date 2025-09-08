<template>
  <view class="breadcrumb-container" v-if="breadcrumbs && breadcrumbs.length > 1">
    <view class="breadcrumb-wrapper">
      <view 
        class="breadcrumb-item" 
        v-for="(item, index) in breadcrumbs" 
        :key="index"
        @click="navigateToPage(item, index)"
      >
        <text class="breadcrumb-text" :class="{ 'active': index === breadcrumbs.length - 1 }">
          {{ item.title }}
        </text>
        <text class="breadcrumb-separator" v-if="index < breadcrumbs.length - 1">›</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {
    // 面包屑数据，格式：[{ title: '首页', path: '/pages/index/index' }, { title: '服务事项', path: '' }]
    items: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    breadcrumbs() {
      // 确保至少有首页
      const defaultBreadcrumbs = [{ title: '首页', path: '/pages/index/index' }]
      
      if (!this.items || this.items.length === 0) {
        return defaultBreadcrumbs
      }
      
      // 如果第一项不是首页，则添加首页
      if (this.items[0].title !== '首页') {
        return [...defaultBreadcrumbs, ...this.items]
      }
      
      return this.items
    }
  },
  methods: {
    navigateToPage(item, index) {
      // 不处理当前页面（最后一项）的点击
      if (index === this.breadcrumbs.length - 1) {
        return
      }
      
      // 如果有路径，则导航到该页面
      if (item.path) {
        if (item.path === '/pages/index/index') {
          // 返回首页使用 reLaunch
          uni.reLaunch({
            url: item.path,
            success: () => {
              console.log('成功跳转到首页')
            },
            fail: (error) => {
              console.error('跳转首页失败:', error)
              uni.showToast({
                title: '跳转失败',
                icon: 'none'
              })
            }
          })
        } else {
          // 其他页面使用 navigateTo
          uni.navigateTo({
            url: item.path,
            success: () => {
              console.log('成功跳转到:', item.path)
            },
            fail: (error) => {
              console.error('页面跳转失败:', error)
              uni.showToast({
                title: '跳转失败',
                icon: 'none'
              })
            }
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.breadcrumb-container {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 16rpx 30rpx;
  margin: 0 30rpx 20rpx 30rpx;
  border-radius: 12rpx;
  backdrop-filter: blur(10rpx);
  position: relative;
  z-index: 999;
}

.breadcrumb-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  margin-right: 8rpx;
}

.breadcrumb-text {
  font-size: 26rpx;
  color: #666666;
  transition: color 0.3s ease;
}

.breadcrumb-text:not(.active) {
  cursor: pointer;
}

.breadcrumb-text:not(.active):hover {
  color: #FF4757;
}

.breadcrumb-text.active {
  color: #333333;
  font-weight: 500;
}

.breadcrumb-separator {
  font-size: 24rpx;
  color: #999999;
  margin: 0 12rpx;
  font-weight: 300;
}
</style>