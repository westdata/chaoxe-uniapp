<template>
  <view class="daily-env-page">
    <!-- 侧边栏导航 -->
    <SidebarNav />

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">{{ pageTitle }}</view>
      <view class="header-right"></view>
    </view>

    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <image class="search-icon" src="/photo/搜索.png" mode="aspectFit"></image>
        <input
          class="search-input"
          placeholder="请输入要查询的内容"
          v-model="searchKeyword"
          @input="onSearchInput"
        />
      </view>
    </view>

    <!-- 环境管理项目列表 -->
    <view class="env-list">
      <view
        class="env-item"
        v-for="item in envList"
        :key="item.id"
        @click="viewDetail(item)"
      >
        <view class="item-left">
          <view class="env-image">
            <image :src="getEnvironmentalImageUrl(item.thumbnail || item.image)" mode="aspectFill" @error="onImageError($event, 'environmental')"></image>
          </view>
          <view class="env-content">
            <view class="env-title">{{ item.title }}</view>
            <view class="env-subtitle">{{ item.subtitle }}</view>
          </view>
        </view>
        <view class="env-action">
          <view class="action-btn">查看详情</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import navigation from '@/utils/navigation.js'
import imageUtils from '@/utils/imageUtils.js'
import SidebarNav from '@/components/SidebarNav.vue'

export default {
  components: {
    SidebarNav
  },
  data() {
    return {
      searchKeyword: '',
      envList: [], // 环境管理要求列表
      serviceId: null, // 父级服务ID
      pageTitle: '环境管理要求', // 默认标题
      parentService: null, // 父级服务信息
      loading: false // 添加加载状态
    }
  },
  onLoad(options) {
    // 获取URL参数中的service_id，如果存在则使用它
    if (options.service_id) {
      this.serviceId = parseInt(options.service_id)
      console.log('接收到service_id:', this.serviceId)
    }
    
    // 如果有标题参数，更新页面标题
    if (options.title) {
      this.pageTitle = decodeURIComponent(options.title)
    }
    
    this.loadEnvironmentalData()
  },
  methods: {
    async loadEnvironmentalData() {
      try {
        this.loading = true
        this.envList = [] // 清空列表
        let response
        
        console.log('=== 开始加载环境管理数据 ===')
        console.log('serviceId:', this.serviceId)
        
        if (this.serviceId) {
          // 如果有serviceId，使用getEnvironmentalRequirementsByService API
          console.log('使用service_id获取环境管理要求列表:', this.serviceId)
          response = await api.getEnvironmentalRequirementsByService(this.serviceId, {
            page: 1,
            page_size: 20,
            is_active: true
          })
          
          console.log('=== API响应详情 ===')
          console.log('response.success:', response.success)
          console.log('response.data:', response.data)
          console.log('response.data类型:', typeof response.data)
          
          if (response.data) {
            console.log('response.data的键:', Object.keys(response.data))
            if (response.data.requirements) {
              console.log('requirements存在')
              console.log('requirements类型:', typeof response.data.requirements)
              console.log('requirements的键:', Object.keys(response.data.requirements))
              console.log('requirements.items:', response.data.requirements.items)
              console.log('requirements.items长度:', response.data.requirements.items?.length)
            } else {
              console.log('requirements不存在')
            }
          }
          
          // 特别处理API返回的特殊数据结构
          if (response.success && response.data && response.data.requirements) {
            console.log('=== 进入特殊处理逻辑 ===')
            // 修正：使用正确的字段名 requirements
            const envItems = response.data.requirements.items || []
            console.log('envItems长度:', envItems.length)
            console.log('envItems内容:', envItems)
            
            if (envItems.length > 0) {
              console.log('=== 开始处理envItems ===')
              this.envList = envItems.map(item => ({
                id: item.id,
                title: item.title,
                subtitle: item.summary || item.description || '环境管理要求',
                thumbnail: item.thumbnail,
                external_url: item.external_url
              }))
              
              console.log('处理后的envList:', this.envList)
              
              // 设置父级服务信息
              if (response.data.service) {
                this.parentService = response.data.service
                if (this.parentService.title) {
                  this.pageTitle = this.parentService.title
                }
                console.log('设置父级服务信息:', this.parentService)
              }
              
              console.log('=== 特殊处理完成，提前返回 ===')
              return // 提前返回，跳过后面的通用处理
            } else {
              console.log('envItems为空，继续执行通用处理逻辑')
            }
          } else {
            console.log('不满足特殊处理条件，继续执行通用处理逻辑')
          }
        } else {
          // 如果没有serviceId，使用默认API获取所有环境管理要求
          console.log('使用默认API获取环境管理要求')
          response = await api.getEnvironmentalRequirements({
            page: 1,
            page_size: 20,
            is_active: true
          })
        }

        // 通用数据处理逻辑（非特殊情况）
        console.log('=== 进入通用处理逻辑 ===')
        if (response.success && response.data) {
          console.log('通用处理 - response.success:', response.success)
          console.log('通用处理 - response.data:', response.data)
          
          // 检查是否有父级服务信息
          if (response.data.service) {
            this.parentService = response.data.service
            if (!this.pageTitle && this.parentService.title) {
              this.pageTitle = this.parentService.title
            }
          }
          
          // 获取环境管理要求列表
          let items = []
          
          if (response.data.items) {
            items = response.data.items
            console.log('通用处理 - 从response.data.items获取:', items.length)
          } else if (Array.isArray(response.data)) {
            items = response.data
            console.log('通用处理 - response.data是数组:', items.length)
          }
          
          console.log('通用处理- 最终items:', items)
          
          if (items && items.length > 0) {
            // 使用API数据
            this.envList = items.map(item => ({
              id: item.id,
              title: item.title,
              subtitle: item.summary || item.description || '环境管理要求',
              thumbnail: item.thumbnail,
              external_url: item.external_url
            }))
            console.log('环境管理要求数据加载成功:', this.envList.length, '条')
          } else {
            // 没有数据时显示空列表
            this.envList = []
            uni.showToast({
              title: '暂无环境管理要求数据',
              icon: 'none',
              duration: 2000
            })
          }
        } else {
          // API请求失败
          this.envList = []
          console.log('=== API请求失败 ===')
          console.log('response.message:', response.message)
          uni.showToast({
            title: response.message || '加载数据失败',
            icon: 'none',
            duration: 2000
          })
        }
      } catch (error) {
        console.error('=== 加载环境管理数据失败 ===')
        console.error('错误详情:', error)
        this.envList = []
        uni.showToast({
          title: '网络连接失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
        console.log('=== 加载完成，最终envList长度:', this.envList.length)
      }
    },

    onSearchInput() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.searchEnvironmental()
      }, 500)
    },

    searchEnvironmental() {
      if (!this.searchKeyword.trim()) {
        this.loadEnvironmentalData()
        return
      }

      // 简单的本地搜索
      const filtered = this.envList.filter(item => 
        item.title.includes(this.searchKeyword) || 
        item.subtitle.includes(this.searchKeyword)
      )
      
      if (filtered.length === 0) {
        uni.showToast({
          title: '未找到相关内容',
          icon: 'none'
        })
      }
    },

    viewDetail(item) {
      console.log('查看详情:', item)
      
      // 如果有外部链接，跳转到webview
      if (item.external_url) {
        navigation.navigateTo(`/pages/webview/webview?url=${encodeURIComponent(item.external_url)}&title=${encodeURIComponent(item.title)}`)
        return
      }
      
      // 默认行为：显示详情弹窗
      uni.showModal({
        title: item.title,
        content: item.subtitle,
        showCancel: false
      })
    },

    goBack() {
      navigation.safeGoBack()
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
.daily-env-page {
  min-height: 100vh;
  background-image: url('photo/服务事项/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background-color: transparent;
  padding: 0 30rpx;
  border-bottom: 1rpx solid rgba(240, 240, 240, 0.3);
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
}

.search-box {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.env-list {
  padding: 0 30rpx;
}

.env-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.env-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.env-image image {
  width: 100%;
  height: 100%;
}

.env-content {
  flex: 1;
}

.env-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.env-subtitle {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
}

.env-action {
  flex-shrink: 0;
}

.action-btn {
  background-color: #FE2741;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 50rpx;
  text-align: center;
  white-space: nowrap;
}
</style>
