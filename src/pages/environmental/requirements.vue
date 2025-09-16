<template>
  <view class="requirements-page">
    <!-- 侧边栏导航 -->
    <SidebarNav />

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">环境管理要求</view>
      <view class="header-right"></view>
    </view>

    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索环境管理要求"
          v-model="searchKeyword"
          @input="onSearchInput"
        />
      </view>
    </view>

    <!-- 办事项目筛选 -->
    <view class="filter-section" v-if="servicesList.length > 0">
      <view class="filter-title">按办事项目筛选</view>
      <scroll-view class="filter-scroll" scroll-x="true">
        <view class="filter-list">
          <view 
            class="filter-item"
            :class="{ 'active': selectedServiceId === null }"
            @click="selectService(null)"
          >
            全部
          </view>
          <view 
            class="filter-item"
            :class="{ 'active': selectedServiceId === service.id }"
            v-for="service in servicesList"
            :key="service.id"
            @click="selectService(service.id)"
          >
            {{ service.title }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 环境管理要求列表 -->
    <view class="requirements-section">
      <!-- 加载状态 -->
      <view v-if="loading && requirementsList.length === 0" class="loading-container">
        <text class="loading-text">正在加载环境管理要求...</text>
      </view>

      <!-- 要求列表 -->
      <view class="requirements-list">
        <view
          class="requirement-item"
          v-for="item in requirementsList"
          :key="item.id"
          @click="viewRequirementDetail(item)"
        >
          <view class="requirement-content">
            <view class="requirement-title">{{ item.title }}</view>
            <view class="requirement-summary">{{ item.summary }}</view>
            <view class="requirement-meta">
              <text class="requirement-service" v-if="item.service_title">
                📋 {{ item.service_title }}
              </text>
              <text class="requirement-views" v-if="item.view_count">
                👁 {{ item.view_count }}
              </text>
            </view>
          </view>
          <view class="requirement-action">
            <view class="view-btn">查看</view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && requirementsList.length === 0" class="empty-container">
        <text class="empty-text">暂无环境管理要求</text>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore" @click="loadMore">
        <text class="load-text">{{ loading ? '加载中...' : '加载更多' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import navigation from '@/utils/navigation.js'
import SidebarNav from '@/components/SidebarNav.vue'

export default {
  components: {
    SidebarNav
  },
  data() {
    return {
      searchKeyword: '',
      loading: false,
      hasMore: true,
      page: 1,
      selectedServiceId: null,
      servicesList: [],
      requirementsList: []
    }
  },
  onLoad(options) {
    // 如果从服务页面跳转过来，带有serviceId参数
    if (options.serviceId) {
      this.selectedServiceId = parseInt(options.serviceId)
    }
    
    this.loadServices()
    this.loadRequirements()
  },
  methods: {
    async loadServices() {
      try {
        const response = await api.getServices({
          page: 1,
          page_size: 20,
          is_active: true
        })

        if (response.success && response.data && response.data.items) {
          this.servicesList = response.data.items.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category
          }))
        }
      } catch (error) {
        console.error('加载办事项目失败:', error)
      }
    },

    async loadRequirements() {
      try {
        this.loading = true
        const params = {
          page: this.page,
          page_size: 10,
          is_active: true
        }

        // 如果有选中的服务项目，添加筛选条件
        if (this.selectedServiceId) {
          params.parent_service_id = this.selectedServiceId
        }

        const response = await api.getEnvironmentalRequirements(params)

        if (response.success && response.data) {
          const items = response.data.items || []
          
          const processedItems = items.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            thumbnail: item.thumbnail,
            external_url: item.external_url,
            view_count: item.view_count || 0,
            service_title: this.getServiceTitle(item.parent_service_id)
          }))
          
          if (this.page === 1) {
            this.requirementsList = processedItems
          } else {
            this.requirementsList.push(...processedItems)
          }
          
          this.hasMore = response.data.total_pages > this.page
        } else {
          // 显示默认数据
          if (this.page === 1) {
            this.requirementsList = [
              {
                id: 'default-1',
                title: '餐饮业油烟排放标准',
                summary: '餐饮服务业油烟排放浓度限值及净化设施要求',
                view_count: 156,
                service_title: '餐饮业环保审批'
              },
              {
                id: 'default-2',
                title: '动物医院废水处理要求',
                summary: '动物医院医疗废水处理设施建设和运行要求',
                view_count: 89,
                service_title: '动物医院环保许可'
              }
            ]
          }
          this.hasMore = false
        }
      } catch (error) {
        console.error('加载环境管理要求失败:', error)
        if (this.page === 1) {
          this.requirementsList = [
            {
              id: 'default-1',
              title: '餐饮业油烟排放标准',
              summary: '餐饮服务业油烟排放浓度限值及净化设施要求',
              view_count: 156,
              service_title: '餐饮业环保审批'
            }
          ]
        }
      } finally {
        this.loading = false
      }
    },

    getServiceTitle(serviceId) {
      if (!serviceId) return ''
      const service = this.servicesList.find(s => s.id === serviceId)
      return service ? service.title : ''
    },

    selectService(serviceId) {
      this.selectedServiceId = serviceId
      this.page = 1
      this.loadRequirements()
    },

    onSearchInput() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.searchRequirements()
      }, 500)
    },

    async searchRequirements() {
      if (!this.searchKeyword.trim()) {
        this.page = 1
        this.selectedServiceId = null
        this.loadRequirements()
        return
      }

      try {
        const response = await api.searchEnvironmentalRequirements(this.searchKeyword, 20)

        if (response.success && response.data) {
          this.requirementsList = response.data.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            thumbnail: item.thumbnail,
            external_url: item.external_url,
            view_count: item.view_count || 0,
            service_title: this.getServiceTitle(item.parent_service_id)
          }))
          this.hasMore = false
        } else {
          this.requirementsList = []
          uni.showToast({
            title: '未找到相关要求',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('搜索失败:', error)
        uni.showToast({
          title: '搜索失败，请重试',
          icon: 'none'
        })
      }
    },

    loadMore() {
      if (!this.loading && this.hasMore) {
        this.page++
        this.loadRequirements()
      }
    },

    viewRequirementDetail(item) {
      console.log('查看环境管理要求详情:', item)
      // 如果有外部链接，跳转到webview页面
      if (item.external_url) {
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(item.external_url)}`
        })
      } else {
        // 显示详情模态框
        uni.showModal({
          title: item.title,
          content: item.summary || item.description || '暂无详细信息',
          showCancel: false
        })
      }
    },

    goBack() {
      navigation.safeGoBack()
    }
  }
}
</script>

<style scoped>
.requirements-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8c8dc 0%, #fde8e8 40%, #f5f5dc 80%, #f0f0e8 100%);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background-color: transparent;
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
}

.search-box {
  background-color: #F8F8F8;
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
}

.search-icon {
  font-size: 32rpx;
  color: #CCCCCC;
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.filter-section {
  background-color: #FFFFFF;
  padding: 30rpx 0;
  margin-bottom: 20rpx;
}

.filter-title {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 20rpx;
  padding: 0 30rpx;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-list {
  display: flex;
  padding: 0 30rpx;
  gap: 16rpx;
}

.filter-item {
  flex-shrink: 0;
  padding: 12rpx 24rpx;
  background-color: #F8F8F8;
  border-radius: 50rpx;
  font-size: 26rpx;
  color: #666666;
  text-align: center;
  white-space: nowrap;
}

.filter-item.active {
  background-color: #FE2741;
  color: #FFFFFF;
}

.requirements-section {
  padding: 0 30rpx;
}

.requirements-list {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
}

.requirement-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #F8F8F8;
}

.requirement-item:last-child {
  border-bottom: none;
}

.requirement-content {
  flex: 1;
}

.requirement-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.requirement-summary {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.requirement-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.requirement-service,
.requirement-views {
  font-size: 24rpx;
  color: #999999;
}

.requirement-service {
  background-color: #F0F8FF;
  color: #4A90E2;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.requirement-action {
  margin-left: 24rpx;
}

.view-btn {
  background-color: #FE2741;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 50rpx;
  text-align: center;
}

.load-more {
  text-align: center;
  padding: 40rpx 0;
}

.load-text {
  color: #999999;
  font-size: 28rpx;
}

.loading-container,
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.loading-text,
.empty-text {
  color: #999;
  font-size: 28rpx;
}
</style>
