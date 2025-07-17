<script>
export default {
  onLaunch: function () {
    console.log('朝阳环保小程序启动')
    // 设置API基础地址
    uni.setStorageSync('API_BASE_URL', 'https://chyxe.cn/chaoxe-api')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style lang="scss">
/* 全局样式 */
@import './uni.scss';

/* 重置样式 */
* {
  box-sizing: border-box;
}

page {
  background-image: url('photo/服务事项/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: 'Alibaba PuHuiTi', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
}

/* 通用容器 */
.container {
  padding: 0 30rpx;
  background-image: url('photo/服务事项/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 通用卡片样式 */
.card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 通用按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #FE2741 0%, #FF4757 100%);
  color: #FFFFFF;
  border-radius: 50rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
  padding: 24rpx 48rpx;
  text-align: center;
}

.btn-primary:active {
  opacity: 0.8;
}

/* 通用文本样式 */
.text-primary {
  color: #FE2741;
}

.text-secondary {
  color: #666666;
}

.text-muted {
  color: #999999;
}

.text-title {
  color: #333333;
  font-size: 32rpx;
  font-weight: 600;
}

.text-subtitle {
  color: #666666;
  font-size: 28rpx;
}

.text-caption {
  color: #999999;
  font-size: 24rpx;
}

/* 通用布局 */
.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-center {
  justify-content: center;
  align-items: center;
}

.flex-between {
  justify-content: space-between;
  align-items: center;
}

.flex-1 {
  flex: 1;
}

/* 通用间距 */
.mt-10 { margin-top: 10rpx; }
.mt-20 { margin-top: 20rpx; }
.mt-30 { margin-top: 30rpx; }
.mb-10 { margin-bottom: 10rpx; }
.mb-20 { margin-bottom: 20rpx; }
.mb-30 { margin-bottom: 30rpx; }
.ml-10 { margin-left: 10rpx; }
.ml-20 { margin-left: 20rpx; }
.mr-10 { margin-right: 10rpx; }
.mr-20 { margin-right: 20rpx; }

.p-10 { padding: 10rpx; }
.p-20 { padding: 20rpx; }
.p-30 { padding: 30rpx; }

/* 状态栏样式 */
.status-bar {
  height: var(--status-bar-height);
  background-color: transparent;
}

/* 搜索框样式 */
.search-box {
  background-color: #F8F8F8;
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  margin: 20rpx 0;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  margin-left: 20rpx;
}

.search-placeholder {
  color: #CCCCCC;
}
</style>
