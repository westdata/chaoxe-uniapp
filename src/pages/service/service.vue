<template>
  <view class="service-page">
    <!-- 侧边栏导航 -->
    <SidebarNav />

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">我要办事</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <image class="search-icon" src="/photo/搜索.png" mode="aspectFit"></image>
        <input
          class="search-input"
          placeholder="请输入搜索内容"
          v-model="searchKeyword"
          @input="onSearchInput"
        />
      </view>
    </view>
    
    <!-- 服务分类 -->
    <view class="category-section">
      <view class="category-grid">
        <view
          class="category-item"
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category)"
        >
          <view class="category-icon-container" :class="{ 'selected': selectedCategoryId === category.id }">
            <image
              class="icon-image"
              :src="selectedCategoryId === category.id ? category.whiteImage : category.image"
              mode="aspectFit"
              @error="onImageError(category)"
            ></image>
            <text class="category-name" :class="{ 'selected': selectedCategoryId === category.id }">{{ category.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 办事内容 -->
    <view class="content-section">
      <view class="section-title">办事内容</view>
      <view class="content-list">
        <!-- 加载状态 -->
        <view v-if="loading && serviceList.length === 0" class="loading-container">
          <text class="loading-text">正在加载服务列表...</text>
        </view>

        <!-- 服务列表 -->
        <view
          class="service-item"
          v-for="item in serviceList"
          :key="item.id"
          @click="viewServiceDetail(item)"
        >
          <view class="service-left">
            <image class="service-image" :src="item.image || '/static/default-service.jpg'" mode="aspectFill"></image>
          </view>
          <view class="service-content">
            <view class="service-title">{{ item.title }}</view>
            <view class="service-description">{{ item.description }}</view>
          </view>
          <view class="service-right">
            <view class="detail-btn">查看详情</view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="!loading && serviceList.length === 0" class="empty-container">
          <text class="empty-text">暂无服务数据</text>
        </view>
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

// 导入图标
import canyin from '@/static/icons/餐饮.png'
import dongwu from '@/static/icons/动物医院.png'
import reli from '@/static/icons/热力生产.png'
import weisheng from '@/static/icons/卫生业.png'
import qixiu from '@/static/icons/汽修.png'
import qita from '@/static/icons/其他.png'

// 导入白色图标
import canyinBai from '@/static/icons/white/餐饮白.png'
import dongwuBai from '@/static/icons/white/动物医院白.png'
import reliBai from '@/static/icons/white/热力生产白.png'
import weishengBai from '@/static/icons/white/卫生业白.png'
import qixiuBai from '@/static/icons/white/汽修白.png'
import qitaBai from '@/static/icons/white/其他白.png'

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
      selectedCategoryId: 1, // 默认选中餐饮 (ID为1)
      categories: [],
      serviceList: []
    }
  },
  onLoad() {
    this.initCategories()
    this.loadServiceList()
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    getIconPath(filename) {
      // 在H5环境中使用相对路径
      return `/static/icons/${filename}`
    },
    getServiceImage(title) {
      // 根据服务标题返回对应的图片
      const imageMap = {
        '选址快速研判': '/photo/服务事项/选址快速研判.jpg',
        '环境影响评价': '/photo/服务事项/环境影响评价.jpg',
        '排污许可管理': '/photo/服务事项/排污许可管理.jpg',
        '日常环境管理要求': '/photo/服务事项/日常环境管理.jpg'
      }
      return imageMap[title] || '/static/service-default.jpg'
    },
    initCategories() {
      this.categories = [
        { id: 1, name: '餐饮', icon: '🍽️', image: canyin, whiteImage: canyinBai, imageLoaded: true },
        { id: 2, name: '动物医院', icon: '🏥', image: dongwu, whiteImage: dongwuBai, imageLoaded: true },
        { id: 3, name: '热力生产', icon: '🔥', image: reli, whiteImage: reliBai, imageLoaded: true },
        { id: 4, name: '卫生业', icon: '🍃', image: weisheng, whiteImage: weishengBai, imageLoaded: true },
        { id: 5, name: '汽修', icon: '🚗', image: qixiu, whiteImage: qixiuBai, imageLoaded: true },
        { id: 6, name: '其他', icon: '📋', image: qita, whiteImage: qitaBai, imageLoaded: true }
      ]
    },
    goBack() {
      navigation.safeGoBack()
    },
    onSearchInput() {
      // 搜索防抖
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.searchServices()
      }, 500)
    },
    selectCategory(category) {
      console.log('选择分类:', category)
      // 始终保持有一个分类被选中，不允许取消选中
      this.selectedCategoryId = category.id
      // 重新加载服务列表
      this.page = 1
      this.loadServiceList()
    },
    async loadServiceList() {
      try {
        this.loading = true
        const params = {
          page: this.page,
          page_size: 10,
          is_active: true
        }

        // 如果有选中的分类，添加分类筛选
        if (this.selectedCategoryId) {
          const selectedCategory = this.categories.find(cat => cat.id === this.selectedCategoryId)
          if (selectedCategory) {
            params.category = selectedCategory.name
          }
        }

        const response = await api.getServices(params)

        if (response.success && response.data) {
          const items = response.data.items || []

          // 处理API返回的数据，确保字段映射正确
          const processedItems = items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.summary || item.description || '暂无描述',
            category: item.category,
            process_time: item.process_time,
            required_materials: item.required_materials,
            contact_info: item.contact_info,
            view_count: item.view_count || 0,
            image: item.thumbnail || this.getServiceImage(item.title),
            external_url: item.external_url,
            has_sub_items: item.has_sub_items
          }))

          if (this.page === 1) {
            this.serviceList = processedItems
          } else {
            this.serviceList.push(...processedItems)
          }

          this.hasMore = response.data.total_pages > this.page

          // 如果第一页没有数据，显示提示
          if (this.page === 1 && this.serviceList.length === 0) {
            uni.showToast({
              title: '暂无服务数据',
              icon: 'none'
            })
          }
        } else {
          // API返回失败，显示默认数据（仅第一页）
          if (this.page === 1) {
            this.serviceList = [
              {
                id: 'default-1',
                title: '餐饮业环保审批',
                description: '餐饮企业环保手续办理指南',
                category: '餐饮',
                process_time: '5-10个工作日',
                required_materials: '营业执照、环评报告等',
                contact_info: '010-12345678',
                view_count: 890,
                image: '/static/service-default.jpg'
              },
              {
                id: 'default-2',
                title: '动物医院环保许可',
                description: '动物医院环保许可证办理流程',
                category: '动物医院',
                process_time: '7-15个工作日',
                required_materials: '医疗机构执业许可证、环评报告等',
                contact_info: '010-12345678',
                view_count: 567,
                image: '/static/service-default.jpg'
              },
              {
                id: 'default-3',
                title: '环境管理要求',
                description: '大气、水、噪声等环境管理要求',
                category: '其他',
                process_time: '即时查看',
                required_materials: '无需材料',
                contact_info: '010-12345678',
                view_count: 6,
                image: '/static/service-default.jpg'
              }
            ]
          }
          this.hasMore = false
        }
      } catch (error) {
        console.error('加载服务列表失败:', error)

        // 网络错误时显示默认数据（仅第一页）
        if (this.page === 1) {
          this.serviceList = [
            {
              id: 'default-1',
              title: '餐饮业环保审批',
              description: '餐饮企业环保手续办理指南',
              category: '餐饮',
              process_time: '5-10个工作日',
              required_materials: '营业执照、环评报告等',
              contact_info: '010-12345678',
              view_count: 890,
              image: '/static/service-default.jpg'
            },
            {
              id: 'default-2',
              title: '动物医院环保许可',
              description: '动物医院环保许可证办理流程',
              category: '动物医院',
              process_time: '7-15个工作日',
              required_materials: '医疗机构执业许可证、环评报告等',
              contact_info: '010-12345678',
              view_count: 567,
              image: '/static/service-default.jpg'
            },
            {
              id: 'default-3',
              title: '环境管理要求',
              description: '大气、水、噪声等环境管理要求',
              category: '其他',
              process_time: '即时查看',
              required_materials: '无需材料',
              contact_info: '010-12345678',
              view_count: 6,
              image: '/static/service-default.jpg'
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
    async searchServices() {
      if (!this.searchKeyword.trim()) {
        // 搜索框清空时，重新加载当前选中分类的服务列表
        this.page = 1
        this.loadServiceList()
        return
      }

      try {
        // 始终基于当前选中的分类进行搜索
        const selectedCategory = this.selectedCategoryId ?
          this.categories.find(cat => cat.id === this.selectedCategoryId)?.name || '' : ''

        const response = await api.searchServices(this.searchKeyword, selectedCategory, 20)

        if (response.success && response.data) {
          // 处理搜索结果，只显示当前选中分类的结果
          const filteredResults = response.data.filter(item => {
            // 如果有选中分类，只显示该分类的结果
            if (selectedCategory) {
              return item.category === selectedCategory
            }
            return true
          })

          this.serviceList = filteredResults.map(item => ({
            id: item.id,
            title: item.title,
            description: item.summary || item.description || '暂无描述',
            category: item.category,
            image: item.thumbnail || this.getServiceImage(item.title),
            external_url: item.external_url,
            has_sub_items: item.has_sub_items
          }))
          this.hasMore = false

          if (this.serviceList.length === 0) {
            uni.showToast({
              title: `在${selectedCategory}分类中未找到相关服务`,
              icon: 'none'
            })
          }
        } else {
          this.serviceList = []
          const selectedCategory = this.categories.find(cat => cat.id === this.selectedCategoryId)?.name || '当前分类'
          uni.showToast({
            title: `在${selectedCategory}中未找到相关服务`,
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
        this.loadServiceList()
      }
    },
    viewServiceDetail(item) {
      console.log('查看服务详情:', item)

      // 1. 如果有外部链接，优先跳转到WebView
      if (item.external_url) {
        // 修改：使用特殊的自适应页面，通过参数传递原始URL
        const adaptiveWebViewUrl = `/pages/webview/webview?url=${encodeURIComponent(item.external_url)}&title=${encodeURIComponent(item.title)}`
        navigation.navigateTo(adaptiveWebViewUrl)
        return
      }

      // 2. 如果有子项目 (如"环境管理要求")，跳转到专门的内部页面
      if (item.has_sub_items) {
        // 修改：跳转到日常环境管理页面，并传递service_id参数
        navigation.navigateTo(`/pages/environmental/daily?service_id=${item.id}&title=${encodeURIComponent(item.title)}`)
        return
      }

      // 3. 处理默认的占位数据
      if (item.id.toString().startsWith('default')) {
        uni.showModal({
          title: item.title,
          content: `${item.description}\n\n办理时间：${item.process_time}\n所需材料：${item.required_materials}\n联系方式：${item.contact_info}`,
          showCancel: false
        })
        return
      }

      // 4. 对于没有外部链接也没有子项目的真实数据，跳转到内部详情页
      navigation.navigateTo(`/pages/service/detail?id=${item.id}`)
    },
    onImageError(category) {
      // 图片加载失败时的处理
      console.log('图片加载失败:', category.name)
    },

    async refreshData() {
      try {
        this.page = 1
        // 保持当前选中的分类，不重置为null
        this.searchKeyword = ''

        await this.loadServiceList()

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
.service-page {
  min-height: 100vh;
  background-image: url('photo/服务事项/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background-color: transparent;
  padding: 0 30rpx;
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
  padding: 30rpx 30rpx 15rpx 30rpx;
  background-color: transparent;
}

.search-box {
  background-color: #FFFFFF;
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid #E5E5E5;
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  margin-left: 20rpx;
}

.category-section {
  background-color: transparent;
  padding: 15rpx 0;
  margin-bottom: 15rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30rpx;
  justify-items: center;
  width: 100%;
  margin: 0;
  padding: 0 30rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rpx 0;
  width: 100%;
}

.category-icon-container {
  width: 180rpx;
  height: 180rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  transition: background-color 0.3s ease;
  border: 1rpx solid #E5E5E5;
  padding: 15rpx;
}

.category-icon-container.selected {
  background-color: #FF4757;
}

.icon-image {
  width: 70rpx;
  height: 70rpx;
  margin-bottom: 10rpx;
}

.category-name {
  font-size: 26rpx;
  color: #333333;
  text-align: center;
  line-height: 1.2;
  transition: color 0.3s ease;
  font-weight: 500;
}

.category-name.selected {
  color: #FFFFFF;
}

.content-section {
  padding: 0 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
  padding: 0;
}

.service-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

.service-left {
  margin-right: 24rpx;
}

.service-image {
  width: 220rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background-color: #F0F0F0;
  object-fit: cover;
}

.service-content {
  flex: 1;
  padding-top: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.service-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}

.service-description {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}



.service-right {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
}

.detail-btn {
  background-color: #FF4757;
  color: #FFFFFF;
  font-size: 20rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  text-align: center;
  white-space: nowrap;
}

.load-more {
  text-align: center;
  padding: 40rpx 0;
}

.load-text {
  color: #999999;
  font-size: 28rpx;
}

/* 加载和空状态样式 */
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
