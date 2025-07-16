<template>
  <view class="activity-page">
    <!-- 侧边栏导航 -->
    <SidebarNav />

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">我要参加</view>
      <view class="header-right"></view>
    </view>

    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 志愿活动 -->
      <view class="volunteer-section">
        <text class="section-title">志愿活动</text>
        <view class="volunteer-grid">
          <view
            class="volunteer-item"
            v-for="item in volunteerItems"
            :key="item.id"
            @click="viewActivityDetail(item)"
          >
            <image class="volunteer-image" :src="getVolunteerImageUrl(item.image || item.thumbnail)" mode="aspectFill" @error="onImageError($event, 'volunteer')"></image>
            <view class="volunteer-content">
              <text class="volunteer-item-title">{{ item.title }}</text>
              <text class="volunteer-item-subtitle">{{ item.subtitle }}</text>
              <view class="volunteer-meta" v-if="item.location || item.current_participants">
                <text class="volunteer-location" v-if="item.location">📍 {{ item.location }}</text>
                <text class="volunteer-participants" v-if="item.current_participants">
                  👥 {{ item.current_participants }}/{{ item.max_participants }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 网红打卡 -->
      <view class="checkin-section">
        <text class="section-title">网红打卡</text>
        <view class="checkin-cards">
          <view
            class="checkin-card"
            v-for="item in checkinSpots"
            :key="item.id"
            @click="viewCheckinDetail(item)"
          >
            <image class="checkin-card-image" :src="getCheckinImageUrl(item.image || item.thumbnail)" mode="aspectFill" @error="onImageError($event, 'checkin')"></image>
            <view class="checkin-card-content">
              <text class="checkin-card-title">{{ item.title }}</text>
              <text class="checkin-card-subtitle">{{ item.subtitle }}</text>
            </view>
          </view>
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
      loading: true,
      volunteerItems: [],
      checkinSpots: []
    }
  },
  onLoad() {
    this.loadPageData()
  },
  onPullDownRefresh() {
    this.loadPageData(true)
  },
  methods: {
    async loadPageData(isRefresh = false) {
      this.loading = true
      try {
        const [volunteerRes, checkinRes] = await Promise.all([
          api.getVolunteerActivities({ page: 1, page_size: 4, is_active: true }),
          api.getPopularSpots(10)
        ])

        // 处理志愿活动数据
        if (volunteerRes.success && volunteerRes.data && volunteerRes.data.items && volunteerRes.data.items.length > 0) {
          this.volunteerItems = volunteerRes.data.items.map(item => ({
            id: item.id,
            title: item.title,
            subtitle: item.summary || '志愿活动',
            image: item.thumbnail || item.cover_image,
            location: item.location,
            activity_time: item.activity_time,
            max_participants: item.max_participants,
            current_participants: item.current_participants,
            external_url: item.registration_url || '' // 修正API字段
          }))
        } else {
          this.volunteerItems = this.getDefaultVolunteerItems()
        }

        // 处理网红打卡数据
        if (checkinRes.success && checkinRes.data && checkinRes.data.length > 0) {
          this.checkinSpots = checkinRes.data.map(spot => ({
            id: spot.id,
            title: spot.title,
            subtitle: spot.address || spot.summary || '热门打卡地点',
            address: spot.address,
            checkin_count: spot.checkin_count,
            image: spot.thumbnail || spot.image_url || spot.cover_image,
            external_url: spot.detail_url || '' // 修正API字段
          }))
        } else {
          this.checkinSpots = this.getDefaultCheckinSpots()
        }

        if (isRefresh) {
          uni.showToast({ title: '刷新成功', icon: 'success' })
        }

      } catch (error) {
        console.error('加载页面数据失败:', error)
        this.volunteerItems = this.getDefaultVolunteerItems()
        this.checkinSpots = this.getDefaultCheckinSpots()
        if (isRefresh) {
          uni.showToast({ title: '刷新失败', icon: 'none' })
        }
      } finally {
        this.loading = false
        if (isRefresh) {
          uni.stopPullDownRefresh()
        }
      }
    },

    getDefaultVolunteerItems() {
      return [
        {
          id: 'default-1',
          title: '522国际生物多样性日',
          subtitle: '2023年主题宣传活动学习',
          image: 'https://chyxe.cn/app/assets/images/image_c89129.png',
          location: '朝阳公园南门',
          activity_time: '2025-07-20T09:00:00Z',
          max_participants: 50,
          current_participants: 23
        },
        {
          id: 'default-2',
          title: '国际生物多样性日',
          subtitle: '深入人心的环保共同体之路',
          image: 'https://chyxe.cn/app/assets/images/image_9da5e4.jpg',
          location: '朝阳区各社区',
          activity_time: '2025-07-25T14:00:00Z',
          max_participants: 30,
          current_participants: 15
        },
        {
          id: 'default-3',
          title: '民法典知识竞赛第二期',
          subtitle: '来测试专业法律知识',
          image: 'https://chyxe.cn/app/assets/images/image_52bc7f.png',
          location: '朝阳区河道',
          activity_time: '2025-07-30T08:00:00Z',
          max_participants: 40,
          current_participants: 28
        },
        {
          id: 'default-4',
          title: '朝阳区2025年度中小学生态环保主题演讲比赛',
          subtitle: '青春志愿 少年环保',
          image: 'https://chyxe.cn/app/assets/images/image_6f5b85.jpg',
          location: '地铁站点',
          activity_time: '2025-08-05T07:30:00Z',
          max_participants: 20,
          current_participants: 12
        }
      ]
    },

    getDefaultCheckinSpots() {
      return [
        {
          id: 'default-1',
          title: '顶个Citywalk黄金攻略',
          subtitle: '每处景点都值得停留',
          image: 'https://chyxe.cn/app/assets/images/olympic_forest.jpg'
        },
        {
          id: 'default-2',
          title: '春个朝阳是生活的主角',
          subtitle: '温暖的春上朝阳',
          image: 'https://chyxe.cn/app/assets/images/chaoyang_park.jpg'
        }
      ]
    },

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

    viewActivityDetail(item) {
      if (item.external_url && item.external_url.startsWith('http')) {
        // #ifdef MP-WEIXIN
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(item.external_url)}`
        })
        // #endif

        // #ifdef APP-PLUS
        uni.openURL({
          url: item.external_url
        })
        // #endif

        // #ifdef H5
        window.open(item.external_url, '_blank')
        // #endif
      } else {
        // 显示活动详情模态框
        uni.showModal({
          title: item.title,
          content: `${item.subtitle}\n\n地点：${item.location || '待定'}\n时间：${this.formatDate(item.activity_time) || '待定'}\n参与人数：${item.current_participants || 0}/${item.max_participants || 0}`,
          showCancel: false
        })
      }
    },

    viewCheckinDetail(item) {
      if (item.external_url && item.external_url.startsWith('http')) {
        // #ifdef MP-WEIXIN
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(item.external_url)}`
        })
        // #endif

        // #ifdef APP-PLUS
        uni.openURL({
          url: item.external_url
        })
        // #endif

        // #ifdef H5
        window.open(item.external_url, '_blank')
        // #endif
      } else {
        // 显示打卡地点详情模态框
        uni.showModal({
          title: item.title,
          content: `${item.subtitle}\n\n地址：${item.address || '待定'}\n打卡人数：${item.checkin_count || 0} 人`,
          showCancel: false
        })
      }
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    },

    async refreshData() {
      // 此方法已合并到 loadPageData
    },

    // 图片处理方法
    getVolunteerImageUrl(imageUrl) {
      return imageUtils.getVolunteerImageUrl(imageUrl)
    },

    getCheckinImageUrl(imageUrl) {
      return imageUtils.getCheckinImageUrl(imageUrl)
    },

    onImageError(event, type = 'default') {
      return imageUtils.handleImageError(event, type)
    }
  }
}
</script>

<style scoped>
.activity-page {
  min-height: 100vh;
  background-image: url('../../../photo/服务事项/image.png');
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
  padding: 20rpx;
}

/* 志愿活动区域 */
.volunteer-section {
  background-color: transparent;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}

.volunteer-section .section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 30rpx;
  display: block;
}

.volunteer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.volunteer-item {
  background: white;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.volunteer-image {
  width: 100%;
  height: 120rpx;
}

.volunteer-content {
  padding: 20rpx;
}

.volunteer-item-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.3;
}

.volunteer-item-subtitle {
  font-size: 22rpx;
  color: #666;
  display: block;
  line-height: 1.4;
  margin-bottom: 8rpx;
}

.volunteer-meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.volunteer-location,
.volunteer-participants {
  font-size: 20rpx;
  color: #999;
  display: block;
}

/* 通用网格布局 */
.section-grid {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.grid-item {
  flex: 1;
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100%;
  height: 120rpx;
}

.item-content {
  padding: 20rpx;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.3;
}

.item-subtitle {
  font-size: 24rpx;
  color: #666;
  display: block;
  line-height: 1.4;
}

/* 网红打卡区域 */
.checkin-section {
  background-color: transparent;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}

.checkin-section .section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 30rpx;
  display: block;
}

.checkin-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.checkin-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 30rpx;
  background-color: #FFFFFF;
}

.checkin-card-image {
  width: 100%;
  height: 300rpx;
  object-fit: cover;
}

.checkin-card-content {
  padding: 20rpx;
  background-color: #FFFFFF;
}

.checkin-card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.checkin-card-subtitle {
  font-size: 26rpx;
  color: #666666;
  display: block;
  line-height: 1.4;
}


</style>
