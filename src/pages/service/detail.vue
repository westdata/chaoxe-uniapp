<template>
  <view class="service-detail-page">
    <!-- 侧边栏导航 -->
    <SidebarNav />

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">{{ serviceTitle }}</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 面包屑导航 -->
    <Breadcrumb :items="breadcrumbItems" />

    <!-- 服务详情内容 -->
    <view class="content-container">
      <view class="service-card">
        <view class="service-header">
          <image class="service-image" :src="serviceImage" mode="aspectFill"></image>
          <view class="service-info">
            <view class="service-name">{{ serviceTitle }}</view>
            <view class="service-category">{{ serviceCategory }}</view>
          </view>
        </view>
        
        <view class="service-details">
          <view class="detail-item">
            <view class="detail-label">服务描述</view>
            <view class="detail-content">{{ serviceDescription }}</view>
          </view>
          
          <view class="detail-item" v-if="processTime">
            <view class="detail-label">办理时间</view>
            <view class="detail-content">{{ processTime }}</view>
          </view>
          
          <view class="detail-item" v-if="requiredMaterials">
            <view class="detail-label">所需材料</view>
            <view class="detail-content">{{ requiredMaterials }}</view>
          </view>
          
          <view class="detail-item" v-if="contactInfo">
            <view class="detail-label">联系方式</view>
            <view class="detail-content">{{ contactInfo }}</view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button class="action-btn primary" @click="startService">开始办理</button>
          <button class="action-btn secondary" @click="contactService">联系咨询</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import navigation from '@/utils/navigation.js'
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
      serviceId: null,
      serviceTitle: '服务详情',
      serviceDescription: '',
      serviceCategory: '',
      serviceImage: '/static/service-default.jpg',
      processTime: '',
      requiredMaterials: '',
      contactInfo: '',
      loading: false
    }
  },
  onLoad(options) {
    if (options.id) {
      this.serviceId = options.id
      this.loadServiceDetail()
    }
    
    // 设置面包屑
    this.setBreadcrumbs([
      { title: '首页', path: '/pages/index/index' },
      { title: '我要办事', path: '/pages/service/service' },
      { title: this.serviceTitle, path: '' }
    ])
  },
  methods: {
    async loadServiceDetail() {
      try {
        this.loading = true
        const response = await api.getServiceDetail(this.serviceId)
        
        if (response.success && response.data) {
          const service = response.data
          this.serviceTitle = service.title
          this.serviceDescription = service.description || service.summary || '暂无详细描述'
          this.serviceCategory = service.category || '服务事项'
          this.serviceImage = service.thumbnail || this.getServiceImage(service.title)
          this.processTime = service.process_time || '请咨询相关部门'
          this.requiredMaterials = service.required_materials || '请咨询相关部门'
          this.contactInfo = service.contact_info || '请咨询相关部门'
          
          // 更新面包屑标题
          this.setBreadcrumbs([
            { title: '首页', path: '/pages/index/index' },
            { title: '我要办事', path: '/pages/service/service' },
            { title: this.serviceTitle, path: '' }
          ])
        } else {
          // 使用默认数据
          this.setDefaultServiceData()
        }
      } catch (error) {
        console.error('加载服务详情失败:', error)
        this.setDefaultServiceData()
        uni.showToast({
          title: '加载失败，显示默认内容',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    setDefaultServiceData() {
      // 根据服务ID设置默认数据
      const defaultServices = {
        'default-1': {
          title: '餐饮业环保审批',
          description: '餐饮企业环保手续办理指南，包括环评报告、排污许可等相关手续的办理流程和要求。',
          category: '餐饮',
          processTime: '5-10个工作日',
          requiredMaterials: '营业执照、环评报告、场地租赁合同等',
          contactInfo: '010-12345678'
        },
        'default-2': {
          title: '动物医院环保许可',
          description: '动物医院环保许可证办理流程，包括医疗废物处理、污水排放等环保要求。',
          category: '动物医院',
          processTime: '7-15个工作日',
          requiredMaterials: '医疗机构执业许可证、环评报告、医疗废物处理协议等',
          contactInfo: '010-12345678'
        }
      }
      
      const defaultData = defaultServices[this.serviceId] || {
        title: '环境影响评价',
        description: '环境影响评价是指对规划和建设项目实施后可能造成的环境影响进行分析、预测和评估，提出预防或者减轻不良环境影响的对策和措施。',
        category: '环保服务',
        processTime: '30-60个工作日',
        requiredMaterials: '项目申请书、环评报告书、相关技术资料等',
        contactInfo: '朝阳区生态环境局 010-12345678'
      }
      
      Object.assign(this, defaultData)
      this.serviceImage = this.getServiceImage(this.serviceTitle)
    },
    
    getServiceImage(title) {
      const imageMap = {
        '选址快速研判': '/photo/服务事项/选址快速研判.jpg',
        '环境影响评价': '/photo/服务事项/环境影响评价.jpg',
        '排污许可管理': '/photo/服务事项/排污许可管理.jpg',
        '日常环境管理要求': '/photo/服务事项/日常环境管理.jpg'
      }
      return imageMap[title] || '/static/service-default.jpg'
    },
    
    goBack() {
      navigation.safeGoBack()
    },
    
    startService() {
      uni.showModal({
        title: '开始办理',
        content: '请前往相关部门或通过官方渠道办理此项服务。',
        showCancel: false
      })
    },
    
    contactService() {
      if (this.contactInfo) {
        uni.showModal({
          title: '联系方式',
          content: this.contactInfo,
          showCancel: false
        })
      } else {
        uni.showToast({
          title: '暂无联系方式',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.service-detail-page {
  min-height: 100vh;
  position: relative;
  padding-bottom: 40rpx;
  background: linear-gradient(to bottom, #f8c8dc 0%, #fde8e8 40%, #f5f5dc 80%, #f0f0e8 100%);
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

.content-container {
  padding: 30rpx;
}

.service-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.service-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.service-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  background-color: #F0F0F0;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.service-category {
  font-size: 26rpx;
  color: #666666;
  background-color: #F8F8F8;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  display: inline-block;
}

.service-details {
  padding: 30rpx;
}

.detail-item {
  margin-bottom: 30rpx;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.detail-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #F0F0F0;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.action-btn.primary {
  background-color: #FF4757;
  color: #FFFFFF;
}

.action-btn.secondary {
  background-color: #F8F8F8;
  color: #333333;
  border: 1rpx solid #E0E0E0;
}

.action-btn::after {
  border: none;
}
</style>