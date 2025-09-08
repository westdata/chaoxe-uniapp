<template>
  <view class="environmental-page">
    <!-- 侧边栏导航 -->
    <SidebarNav />

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">日常环境管理</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 面包屑导航 -->
    <Breadcrumb :items="breadcrumbItems" />
    
    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="请输入搜索内容"
          v-model="searchKeyword"
          @input="onSearchInput"
        />
      </view>
    </view>
    
    <!-- 环境管理要求列表 -->
    <view class="requirements-list">
      <view 
        class="requirement-item card" 
        v-for="item in requirementsList" 
        :key="item.id"
        @click="viewRequirementDetail(item)"
      >
        <view class="item-left">
          <image class="item-image" :src="getEnvironmentalImageUrl(item.thumbnail)" mode="aspectFill" @error="onImageError($event, 'environmental')"></image>
        </view>
        <view class="item-content">
          <view class="item-title">{{ item.title }}</view>
          <view class="item-description">{{ item.summary }}</view>
        </view>
        <view class="item-right">
          <view class="action-btn">查看详情</view>
        </view>
      </view>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore" @click="loadMore">
      <text class="load-text">{{ loading ? '加载中...' : '加载更多' }}</text>
    </view>
    
    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item">
        <text class="nav-icon">🏠</text>
        <text class="nav-text">返回首页</text>
      </view>
      <view class="nav-item active">
        <text class="nav-icon">💬</text>
        <text class="nav-text">朝小e</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import navigation from '@/utils/navigation.js'
import imageUtils from '@/utils/imageUtils.js'
import SidebarNav from '@/components/SidebarNav.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import breadcrumbMixin from '@/mixins/breadcrumbMixin.js'

export default {
  components: {
    SidebarNav,
    Breadcrumb
  },
  mixins: [breadcrumbMixin],
  data() {
    return {
      searchKeyword: '',
      loading: false,
      hasMore: true,
      page: 1,
      requirementsList: []
    }
  },
  onLoad() {
    this.loadRequirementsList()
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({
          fail: () => {
            // 如果返回失败，跳转到首页
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }
        })
      } else {
        // 如果没有历史页面，跳转到首页
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }
    },
    onSearchInput() {
      // 搜索防抖
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.searchRequirements()
      }, 500)
    },
    async loadRequirementsList() {
      try {
        this.loading = true
        const response = await api.getEnvironmentalRequirements({
          page: this.page,
          page_size: 10,
          is_active: true
        })

        if (response.success && response.data) {
          if (this.page === 1) {
            this.requirementsList = response.data.items || []
          } else {
            this.requirementsList.push(...(response.data.items || []))
          }
          this.hasMore = response.data.has_next || false

          // 如果第一页没有数据，显示提示
          if (this.page === 1 && this.requirementsList.length === 0) {
            uni.showToast({
              title: '暂无环境管理要求',
              icon: 'none'
            })
          }
        } else {
          // API返回失败，显示默认数据（仅第一页）
          if (this.page === 1) {
            this.requirementsList = [
              {
                id: 'default-1',
                title: '大气污染防治管理',
                description: '排放限值、治理设施要求等',
                image: '/static/env1.jpg'
              },
              {
                id: 'default-2',
                title: '水污染防治管理',
                description: '法律法规、标准规定等',
                image: '/static/env2.jpg'
              }
            ]
          }
          this.hasMore = false
        }
      } catch (error) {
        console.error('加载环境管理要求失败:', error)

        // 网络错误时显示默认数据（仅第一页）
        if (this.page === 1) {
          this.requirementsList = [
            {
              id: 'default-1',
              title: '大气污染防治管理',
              description: '排放限值、治理设施要求等',
              image: '/static/env1.jpg'
            },
            {
              id: 'default-2',
              title: '水污染防治管理',
              description: '法律法规、标准规定等',
              image: '/static/env2.jpg'
            }
          ]
        }

        uni.showToast({
          title: '网络连接失败，显示默认内容',
          icon: 'none',
          duration: 3000
        })
      } finally {
        this.loading = false
      }
    },
    async searchRequirements() {
      if (!this.searchKeyword.trim()) {
        this.page = 1
        this.loadRequirementsList()
        return
      }

      try {
        const response = await api.searchEnvironmentalRequirements(this.searchKeyword, 20)

        if (response.success) {
          this.requirementsList = response.data
          this.hasMore = false
        }
      } catch (error) {
        console.error('搜索失败:', error)
      }
    },
    loadMore() {
      if (!this.loading && this.hasMore) {
        this.page++
        this.loadRequirementsList()
      }
    },
    viewRequirementDetail(item) {
      console.log('查看环境管理要求详情:', item)
      // 跳转到详情页面或显示详情
      uni.showModal({
        title: item.title,
        content: item.description,
        showCancel: false
      })
    },

    // 图片处理方法
    getEnvironmentalImageUrl(imageUrl) {
      return imageUtils.getEnvironmentalImageUrl(imageUrl)
    },

    onImageError(event, type = 'environmental') {
      return imageUtils.handleImageError(event, type)
    }
  }
}
</script>

<style scoped>
.environmental-page {
  min-height: 100vh;
  background-image: url('photo/服务事项/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-bottom: 150rpx;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background-image: url('photo/服务事项/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
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

.search-container {
  padding: 30rpx;
  background-color: #FFFFFF;
  margin-bottom: 20rpx;
}

.search-box {
  background-color: #F8F8F8;
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid #4A90E2;
}

.search-icon {
  font-size: 32rpx;
  color: #CCCCCC;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  margin-left: 20rpx;
}

.requirements-list {
  padding: 0 30rpx;
}

.requirement-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.item-left {
  margin-right: 24rpx;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background-color: #F0F0F0;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.item-description {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
}

.item-right {
  margin-left: 24rpx;
}

.action-btn {
  background-color: #FE2741;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 50rpx;
}

.load-more {
  text-align: center;
  padding: 40rpx 0;
}

.load-text {
  color: #999999;
  font-size: 28rpx;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: #FFFFFF;
  border-top: 1rpx solid #F0F0F0;
  padding: 20rpx;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

.nav-item.active .nav-icon {
  color: #FE2741;
}

.nav-item.active .nav-text {
  color: #FE2741;
}

.nav-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.nav-text {
  font-size: 24rpx;
  color: #666666;
}
</style>
