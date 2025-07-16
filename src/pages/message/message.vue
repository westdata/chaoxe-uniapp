<template>
  <view class="message-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">我要留言</view>
      <view class="header-right"></view>
    </view>

    <!-- 侧边栏导航 -->
    <view class="sidebar-nav">
      <view class="nav-item" @click="goHome">
        <image class="nav-icon-img" src="../../static/icons/房子.png" mode="aspectFit"></image>
        <text class="nav-text">返回首页</text>
      </view>
      <view class="nav-divider"></view>
      <view class="nav-item active" @click="goToCustomerService">
        <image class="nav-icon-img" src="../../static/icons/white/朝小易红.png" mode="aspectFit" @error="onImageError"></image>
        <text class="nav-text">朝小e</text>
      </view>
    </view>
    
    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 问题类型 -->
      <view class="form-item">
        <view class="form-label required">问题类型</view>
        <view class="form-value" @click="showTypePicker">
          <text 
            class="value-text"
            :class="{ 'is-selected': selectedType.name }"
          >{{ selectedType.name || '请选择' }}</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>
      
      <!-- 姓名和联系方式 -->
      <view class="form-item combined-item">
        <view class="combined-fields">
          <view class="field-group" v-if="!formData.is_anonymous">
            <view class="form-label required">姓名</view>
            <view class="form-value-container">
              <input
                class="form-input-right"
                placeholder="请输入"
                v-model="formData.name"
                maxlength="50"
              />
              <text class="arrow-icon">›</text>
            </view>
          </view>
          <view class="field-group">
            <view class="form-label required">联系方式</view>
            <view class="form-value-container">
              <input
                class="form-input-right"
                placeholder="请输入联系方式"
                v-model="formData.phone"
                type="number"
                maxlength="11"
              />
              <text class="arrow-icon">›</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 问题描述和文件上传 -->
      <view class="form-item textarea-item combined-textarea">
        <view class="form-label required">问题描述</view>
        <view class="textarea-wrapper">
          <textarea
            class="form-textarea"
            :class="{ 'is-invalid': contentIsInvalid }"
            placeholder="请描述您遇到的问题，不少于15字"
            v-model="formData.content"
            maxlength="2000"
            :show-count="true"
          ></textarea>
          <view v-if="contentIsInvalid" class="error-tooltip">
            问题描述不能少于15个字
          </view>

          <!-- 文件上传区域 -->
          <view class="upload-area-inline">
            <view class="upload-area" @click="chooseFile">
              <view class="upload-icon">
                <text class="plus-icon">+</text>
              </view>
            </view>

            <!-- 已上传文件列表 -->
            <view class="file-list" v-if="uploadedFiles.length > 0">
              <view
                class="file-item"
                v-for="(file, index) in uploadedFiles"
                :key="index"
              >
                <text class="file-name">{{ file.name }}</text>
                <text class="file-remove" @click="removeFile(index)">×</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 是否匿名 -->
      <view class="anonymous-section">
        <view class="anonymous-item">
          <text class="anonymous-label">是否匿名</text>
          <switch 
            :checked="formData.is_anonymous" 
            @change="onAnonymousChange"
            color="#FE2741"
          />
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button 
          class="submit-btn" 
          @click="submitMessage"
          :disabled="!canSubmit"
        >
          立即提交
        </button>
      </view>
    </view>
    
    <!-- 类型选择器 -->
    <view class="type-picker" v-if="showPicker" @click="hidePicker">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择问题类型</text>
          <text class="picker-close" @click="hidePicker">×</text>
        </view>
        <view class="picker-list">
          <view 
            class="picker-item" 
            v-for="type in messageTypes" 
            :key="type.value"
            @click="selectType(type)"
          >
            <text class="type-name">{{ type.name }}</text>
            <text class="type-check" v-if="selectedType.value === type.value">✓</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      showPicker: false,
      selectedType: {},
      uploadedFiles: [],
      formData: {
        type: '',
        name: '',
        phone: '',
        content: '',
        is_anonymous: false,
        attachments: []
      },
      messageTypes: [
        { value: '咨询类', name: '咨询类' },
        { value: '投诉举报类', name: '投诉举报类' },
        { value: '建议意见类', name: '建议意见类' },
        { value: '其他类', name: '其他类' }
      ]
    }
  },
  computed: {
    canSubmit() {
      const nameIsValid = this.formData.is_anonymous || this.formData.name.trim()
      return nameIsValid &&
             this.formData.phone.trim() &&
             this.formData.content.trim().length >= 15 &&
             !!this.selectedType.value
    },
    contentIsInvalid() {
      const contentLength = this.formData.content.trim().length
      return contentLength > 0 && contentLength < 15
    }
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
    showTypePicker() {
      this.showPicker = true
    },
    hidePicker() {
      this.showPicker = false
    },
    selectType(type) {
      this.selectedType = type
      this.formData.type = type.value
      this.hidePicker()
    },
    onAnonymousChange(e) {
      this.formData.is_anonymous = e.detail.value
      if (this.formData.is_anonymous) {
        this.formData.name = ''
      }
    },
    chooseFile() {
      if (this.uploadedFiles.length >= 5) {
        uni.showToast({
          title: '最多只能上传5个文件',
          icon: 'none'
        })
        return
      }
      
      uni.chooseFile({
        count: 5 - this.uploadedFiles.length,
        type: 'all',
        success: (res) => {
          this.uploadFiles(res.tempFiles)
        }
      })
    },
    async uploadFiles(files) {
      for (let file of files) {
        try {
          const response = await api.uploadFile(file.path, {
            related_table: 'messages'
          })

          if (response.success) {
            this.uploadedFiles.push({
              id: response.data.id,
              name: file.name,
              url: response.data.url
            })
            this.formData.attachments.push(response.data.id)
          }
        } catch (error) {
          console.error('文件上传失败:', error)
          uni.showToast({
            title: '文件上传失败',
            icon: 'none'
          })
        }
      }
    },
    removeFile(index) {
      this.uploadedFiles.splice(index, 1)
      this.formData.attachments.splice(index, 1)
    },
    async submitMessage() {
      if (!this.canSubmit) {
        uni.showToast({
          title: '请完善表单信息',
          icon: 'none'
        })
        return
      }
      
      // 验证手机号
      if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: '提交中...' })

        const response = await api.submitMessage(this.formData)

        if (response.success) {
          uni.showModal({
            title: '提交成功',
            content: '感谢您的留言，我们将会尽快处理。',
            showCancel: false,
            confirmText: '好的',
            success: (res) => {
              if (res.confirm) {
                this.resetForm()
                // 可选：滚动到页面顶部
                uni.pageScrollTo({
                  scrollTop: 0,
                  duration: 300
                })
              }
            }
          })
        } else {
          throw new Error(response.message || '提交失败')
        }
      } catch (error) {
        console.error('提交留言失败:', error)
        uni.showToast({
          title: error.message || '提交失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    resetForm() {
      this.formData = {
        type: '',
        name: '',
        phone: '',
        content: '',
        is_anonymous: false,
        attachments: []
      }
      this.selectedType = {}
      this.uploadedFiles = []
    },
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
.message-page {
  min-height: 100vh;
  background-image: url('../../../photo/服务事项/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-bottom: 200rpx;
}

.required::after {
  content: ' *';
  color: #FE2741;
  font-weight: 700;
  margin-left: 4rpx;
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

.form-container {
  padding: 30rpx;
}

.form-item {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.form-label {
  font-size: 32rpx;
  color: #333333;
  width: 160rpx;
  flex-shrink: 0;
}

.form-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.value-text {
  font-size: 32rpx;
  color: #CCCCCC;
  text-align: right;
  flex: 1;
}

.value-text.is-selected {
  color: #333333;
}

.arrow-icon {
  font-size: 32rpx;
  color: #CCCCCC;
  font-weight: 300;
}

.form-input {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
}

/* 合并字段样式 */
.combined-item {
  flex-direction: column;
  align-items: stretch;
}

.combined-fields {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.field-group {
  display: flex;
  align-items: center;
}

.field-group .form-label {
  width: 160rpx;
  flex-shrink: 0;
}

.field-group .form-input {
  flex: 1;
}

.form-value-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-input-right {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
  text-align: right;
  border: none;
  background: transparent;
}

.form-input-right::placeholder {
  color: #CCCCCC;
  text-align: right;
}

.textarea-item {
  align-items: flex-start;
  padding: 30rpx;
}

.combined-textarea {
  flex-direction: column;
}

.form-textarea {
  width: 100%;
  min-height: 300rpx;
  font-size: 32rpx;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 20rpx;
  padding: 16rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.3s ease;
}

.form-textarea.is-invalid {
  border-color: #FE2741;
}

.textarea-wrapper {
  width: 100%;
  position: relative;
}

.error-tooltip {
  color: #FE2741;
  font-size: 24rpx;
  position: absolute;
  bottom: 30rpx;
  left: 20rpx;
}

.upload-area-inline {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.upload-section {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.upload-area {
  width: 120rpx;
  height: 120rpx;
  background-color: #F8F8F8;
  border: 2rpx dashed #CCCCCC;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-icon {
  font-size: 48rpx;
  color: #FE2741;
  font-weight: 300;
}

.file-list {
  margin-top: 20rpx;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.file-name {
  font-size: 28rpx;
  color: #666666;
  flex: 1;
}

.file-remove {
  font-size: 32rpx;
  color: #FE2741;
  width: 40rpx;
  text-align: center;
}

.anonymous-section {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.anonymous-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.anonymous-label {
  font-size: 32rpx;
  color: #333333;
}

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
  font-weight: 400;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  padding: 30rpx;
  border-top: 1rpx solid #F0F0F0;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #FE2741 0%, #FF4757 100%) !important;
  color: #FFFFFF !important;
  border-radius: 50rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
  padding: 20rpx;
  text-align: center;
  height: 80rpx;
  line-height: 40rpx;
}

.submit-btn::after {
  border: none;
}

.submit-btn:disabled, .submit-btn[disabled] {
  background: #E0E0E0 !important;
  color: #A0A0A0 !important;
  cursor: not-allowed;
}

.type-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.picker-content {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.picker-close {
  font-size: 48rpx;
  color: #CCCCCC;
  width: 60rpx;
  text-align: center;
}

.picker-list {
  padding: 0 30rpx 30rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F8F8F8;
}

.type-name {
  font-size: 32rpx;
  color: #333333;
}

.type-check {
  font-size: 32rpx;
  color: #FE2741;
  font-weight: 600;
}
</style>
