<template>
  <view class="daily-env-page">
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
      envList: [],
      defaultEnvList: [
        {
          id: 1,
          title: '大气污染防护管理',
          subtitle: '废气排放、设备设施管理要求',
          thumbnail: 'https://chyxe.cn/app/assets/images/air_pollution.jpg'
        },
        {
          id: 2,
          title: '水污染防治管理',
          subtitle: '污水排放、标准规范要求',
          thumbnail: 'https://chyxe.cn/app/assets/images/water_pollution.jpg'
        },
        {
          id: 3,
          title: '固体废物管理',
          subtitle: '固废分类收集、转移及处置',
          thumbnail: 'https://chyxe.cn/app/assets/images/solid_waste.jpg'
        },
        {
          id: 4,
          title: '噪声污染防治管理',
          subtitle: '工业噪声、建筑施工噪声',
          thumbnail: 'https://chyxe.cn/app/assets/images/noise_control.jpg'
        },
        {
          id: 5,
          title: '环境风险管理要求',
          subtitle: '应急预案、环境风险管控',
          thumbnail: '/static/env/risk-management.jpg'
        },
        {
          id: 6,
          title: '重要参考文件',
          subtitle: '法律法规、标准规范等内容',
          thumbnail: '/static/env/documents.jpg'
        }
      ]
    }
  },
  onLoad() {
    this.loadEnvironmentalData()
  },
  methods: {
    async loadEnvironmentalData() {
      try {
        // 从API加载数据
        const response = await api.getEnvironmentalRequirements({
          page: 1,
          page_size: 20,
          is_active: true
        })

        if (response.success && response.data && response.data.items && response.data.items.length > 0) {
          // 使用API数据，图片URL已经在API层处理过了
          this.envList = response.data.items.map(item => ({
            id: item.id,
            title: item.title,
            subtitle: item.summary || item.description || '环境管理要求',
            thumbnail: item.thumbnail
          }))
          console.log('环境管理要求数据加载成功:', this.envList.length, '条')
        } else {
          // 使用默认数据
          this.envList = this.defaultEnvList
          console.log('使用默认环境管理数据')
        }
      } catch (error) {
        console.error('加载环境管理数据失败:', error)
        // 出错时使用默认数据
        this.envList = this.defaultEnvList
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
  background-image: url('../../../photo/服务事项/image.png');
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
