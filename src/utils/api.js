// API工具类
class ApiService {
  constructor() {
    // 检测运行环境
    const isH5Dev = typeof window !== 'undefined' &&
                    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

    // 开发环境使用代理，生产环境直接使用API地址
    this.baseUrl = isH5Dev ? '/api' : 'https://chyxe.cn/chaoxe-api'

    // 图片资源基础地址
    this.imageBaseUrl = 'https://chyxe.cn/app/assets/images'

    console.log('API Base URL:', this.baseUrl)
    console.log('Image Base URL:', this.imageBaseUrl)
  }

  // 处理图片URL，确保图片地址正确
  processImageUrl(imageUrl, fallbackImage = '/static/default-image.jpg') {
    if (!imageUrl) {
      return fallbackImage
    }

    // 如果已经是完整的URL，直接返回
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    // 如果是相对路径，拼接基础地址
    if (imageUrl.startsWith('/')) {
      return `${this.imageBaseUrl}${imageUrl}`
    }

    // 如果只是文件名，拼接完整路径
    return `${this.imageBaseUrl}/${imageUrl}`
  }

  // 处理API响应数据中的图片字段
  processApiResponse(data, imageFields = []) {
    if (!data) return data

    // 如果是数组，递归处理每个元素
    if (Array.isArray(data)) {
      return data.map(item => this.processApiResponse(item, imageFields))
    }

    // 如果是对象，处理图片字段
    if (typeof data === 'object') {
      const processedData = { ...data }

      // 处理指定的图片字段
      imageFields.forEach(field => {
        if (processedData[field]) {
          processedData[field] = this.processImageUrl(processedData[field])
        }
      })

      // 处理常见的图片字段
      const commonImageFields = ['image_url', 'thumbnail', 'cover_image', 'image', 'avatar', 'icon']
      commonImageFields.forEach(field => {
        if (processedData[field] && !imageFields.includes(field)) {
          processedData[field] = this.processImageUrl(processedData[field])
        }
      })

      return processedData
    }

    return data
  }

  // 通用请求方法
  async request(options) {
    const { url, method = 'GET', data = {}, header = {} } = options
    const fullUrl = `${this.baseUrl}${url}`

    console.log(`API请求: ${method} ${fullUrl}`, data)

    try {
      const response = await uni.request({
        url: fullUrl,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...header
        }
      })

      console.log(`API响应: ${method} ${fullUrl}`, response.data)
      return response.data
    } catch (error) {
      console.error(`API请求失败: ${method} ${fullUrl}`, error)
      throw error
    }
  }

  // GET请求
  async get(url, params = {}) {
    return this.request({
      url: params ? `${url}?${this.buildQuery(params)}` : url,
      method: 'GET'
    })
  }

  // POST请求
  async post(url, data = {}) {
    return this.request({
      url,
      method: 'POST',
      data
    })
  }

  // PUT请求
  async put(url, data = {}) {
    return this.request({
      url,
      method: 'PUT',
      data
    })
  }

  // DELETE请求
  async delete(url) {
    return this.request({
      url,
      method: 'DELETE'
    })
  }

  // 构建查询字符串
  buildQuery(params) {
    return Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
  }

  // 文件上传
  async uploadFile(filePath, formData = {}) {
    try {
      const response = await uni.uploadFile({
        url: `${this.baseUrl}/api/v1/upload/`,
        filePath,
        name: 'file',
        formData
      })

      return JSON.parse(response.data)
    } catch (error) {
      console.error('文件上传失败:', error)
      throw error
    }
  }

  // 上传多个文件
  async uploadMultipleFiles(filePaths, formData = {}) {
    try {
      const uploadPromises = filePaths.map(filePath =>
        uni.uploadFile({
          url: `${this.baseUrl}/api/v1/upload/multiple`,
          filePath,
          name: 'files',
          formData
        })
      )

      const responses = await Promise.all(uploadPromises)
      return responses.map(response => JSON.parse(response.data))
    } catch (error) {
      console.error('多文件上传失败:', error)
      throw error
    }
  }

  // 删除文件
  async deleteFile(fileId) {
    return this.delete(`/api/v1/upload/${fileId}`)
  }

  // 获取文件信息
  async getFileInfo(fileId) {
    return this.get(`/api/v1/upload/info/${fileId}`)
  }

  // 轮播图相关接口
  async getBanners(params = {}) {
    const response = await this.get('/api/v1/banners/', params)
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['image_url'])
    }
    return response
  }

  async getActiveBanners(limit = 10) {
    const response = await this.get('/api/v1/banners/active/list', { limit })
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['image_url'])
    }
    return response
  }

  async getBannerDetail(bannerId) {
    const response = await this.get(`/api/v1/banners/${bannerId}`)
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['image_url'])
    }
    return response
  }

  // 环保成果相关接口
  async getAchievements(params = {}) {
    const response = await this.get('/api/v1/achievements/', params)
    if (response.success && response.data) {
      if (response.data.items) {
        response.data.items = this.processApiResponse(response.data.items, ['thumbnail'])
      } else {
        response.data = this.processApiResponse(response.data, ['thumbnail'])
      }
    }
    return response
  }

  async getLatestAchievements(limit = 5) {
    const response = await this.get('/api/v1/achievements/published/latest', { limit })
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail'])
    }
    return response
  }

  async getAchievementDetail(achievementId) {
    const response = await this.get(`/api/v1/achievements/${achievementId}`)
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail', 'images'])
      // 处理images数组中的每个图片URL
      if (response.data.images && Array.isArray(response.data.images)) {
        response.data.images = response.data.images.map(img => this.processImageUrl(img))
      }
    }
    return response
  }

  // 办事服务相关接口
  async getServices(params = {}) {
    const response = await this.get('/api/v1/services/', params)
    if (response.success && response.data) {
      if (response.data.items) {
        response.data.items = this.processApiResponse(response.data.items, ['thumbnail'])
      } else {
        response.data = this.processApiResponse(response.data, ['thumbnail'])
      }
    }
    return response
  }

  async searchServices(keyword, category = '', limit = 20) {
    const response = await this.get('/api/v1/services/search', { q: keyword, category, limit })
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail'])
    }
    return response
  }

  async getServiceCategories() {
    const response = await this.get('/api/v1/services/categories')
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['icon', 'image'])
    }
    return response
  }

  async getServiceDetail(serviceId) {
    const response = await this.get(`/api/v1/services/${serviceId}`)
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail'])
    }
    return response
  }

  async getServiceEnvironmentalRequirements(serviceId, params = {}) {
    const response = await this.get(`/api/v1/services/${serviceId}/environmental-requirements`, params)
    if (response.success && response.data) {
      if (response.data.items) {
        response.data.items = this.processApiResponse(response.data.items, ['thumbnail'])
      } else {
        response.data = this.processApiResponse(response.data, ['thumbnail'])
      }
    }
    return response
  }

  // 环境管理要求相关接口
  async getEnvironmentalRequirements(params = {}) {
    const response = await this.get('/api/v1/environmental-requirements/', params)
    if (response.success && response.data) {
      if (response.data.items) {
        response.data.items = this.processApiResponse(response.data.items, ['thumbnail'])
      } else {
        response.data = this.processApiResponse(response.data, ['thumbnail'])
      }
    }
    return response
  }

  async searchEnvironmentalRequirements(keyword, limit = 20) {
    const response = await this.get('/api/v1/environmental-requirements/search', { q: keyword, limit })
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail'])
    }
    return response
  }

  async getEnvironmentalRequirementsByService(serviceId, params = {}) {
    const response = await this.get(`/api/v1/environmental-requirements/by-service/${serviceId}`, params)
    if (response.success && response.data) {
      if (response.data.items) {
        response.data.items = this.processApiResponse(response.data.items, ['thumbnail'])
      } else {
        response.data = this.processApiResponse(response.data, ['thumbnail'])
      }
    }
    return response
  }

  async getEnvironmentalRequirementDetail(requirementId) {
    const response = await this.get(`/api/v1/environmental-requirements/${requirementId}`)
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail'])
    }
    return response
  }

  // 留言相关接口
  async submitMessage(messageData) {
    return this.post('/api/v1/messages/', messageData)
  }

  async getMessages(params = {}) {
    return this.get('/api/v1/messages/', params)
  }

  async getMessageDetail(messageId) {
    return this.get(`/api/v1/messages/${messageId}`)
  }

  async replyMessage(messageId, replyData) {
    return this.put(`/api/v1/messages/${messageId}/reply`, replyData)
  }

  async getMessageStats() {
    return this.get('/api/v1/messages/stats/summary')
  }

  // 志愿活动相关接口
  async getVolunteerActivities(params = {}) {
    const response = await this.get('/api/v1/volunteer-activities/', params)
    if (response.success && response.data) {
      if (response.data.items) {
        response.data.items = this.processApiResponse(response.data.items, ['thumbnail', 'cover_image'])
      } else {
        response.data = this.processApiResponse(response.data, ['thumbnail', 'cover_image'])
      }
    }
    return response
  }

  async getUpcomingActivities(limit = 5) {
    const response = await this.get('/api/v1/volunteer-activities/upcoming/list', { limit })
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail', 'cover_image'])
    }
    return response
  }

  async getActivityDetail(activityId) {
    const response = await this.get(`/api/v1/volunteer-activities/${activityId}`)
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail', 'cover_image'])
    }
    return response
  }

  // 打卡地点相关接口
  async getCheckinSpots(params = {}) {
    const response = await this.get('/api/v1/checkin-spots/', params)
    if (response.success && response.data) {
      if (response.data.items) {
        response.data.items = this.processApiResponse(response.data.items, ['thumbnail'])
      } else {
        response.data = this.processApiResponse(response.data, ['thumbnail'])
      }
    }
    return response
  }

  async getPopularSpots(limit = 10) {
    const response = await this.get('/api/v1/checkin-spots/popular/list', { limit })
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail'])
    }
    return response
  }

  async checkin(spotId) {
    return this.post(`/api/v1/checkin-spots/${spotId}/checkin`)
  }

  async searchNearbySpots(latitude, longitude, radius = 5.0, limit = 20) {
    const response = await this.get('/api/v1/checkin-spots/nearby/search', {
      latitude,
      longitude,
      radius,
      limit
    })
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail'])
    }
    return response
  }

  async getCheckinSpotDetail(spotId) {
    const response = await this.get(`/api/v1/checkin-spots/${spotId}`)
    if (response.success && response.data) {
      response.data = this.processApiResponse(response.data, ['thumbnail'])
    }
    return response
  }

  // 系统相关接口
  async getSystemInfo() {
    return this.get('/api/v1/system/info')
  }

  async getSystemHealth() {
    return this.get('/api/v1/system/health')
  }

  async getSystemStats() {
    return this.get('/api/v1/system/stats')
  }

  async getChatbotUrl() {
    return this.get('/api/v1/system/chatbot')
  }

  async getAssistantConfig() {
    return this.get('/api/v1/system/assistant')
  }
}

// 创建API实例
const api = new ApiService()

// 导出API实例
export default api

// 也可以导出具体的方法供直接使用
export const {
  getBanners,
  getActiveBanners,
  getBannerDetail,
  getAchievements,
  getLatestAchievements,
  getAchievementDetail,
  getServices,
  searchServices,
  getServiceCategories,
  getServiceDetail,
  getServiceEnvironmentalRequirements,
  getEnvironmentalRequirements,
  searchEnvironmentalRequirements,
  getEnvironmentalRequirementsByService,
  getEnvironmentalRequirementDetail,
  submitMessage,
  getMessages,
  getMessageDetail,
  getMessageStats,
  getVolunteerActivities,
  getUpcomingActivities,
  getActivityDetail,
  getCheckinSpots,
  getPopularSpots,
  getCheckinSpotDetail,
  checkin,
  searchNearbySpots,
  getSystemInfo,
  getSystemHealth,
  getSystemStats,
  getChatbotUrl,
  getAssistantConfig,
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFileInfo
} = api
