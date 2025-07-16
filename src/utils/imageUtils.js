// 图片处理工具类
class ImageUtils {
  constructor() {
    // 图片资源基础地址
    this.imageBaseUrl = 'https://chyxe.cn/app/assets/images'
    
    // 默认图片映射
    this.defaultImages = {
      banner: '/static/banner-default.jpg',
      achievement: '/static/achievement-default.jpg',
      service: '/static/service-default.jpg',
      environmental: '/static/default-env.jpg',
      volunteer: '/static/volunteer-default.jpg',
      checkin: '/static/checkin-default.jpg',
      activity: '/static/activity-default.jpg',
      default: '/static/default-image.jpg'
    }
  }

  /**
   * 处理图片URL，确保图片地址正确
   * @param {string} imageUrl - 原始图片URL
   * @param {string} fallbackType - 默认图片类型
   * @returns {string} 处理后的图片URL
   */
  processImageUrl(imageUrl, fallbackType = 'default') {
    if (!imageUrl) {
      return this.defaultImages[fallbackType] || this.defaultImages.default
    }
    
    // 如果已经是完整的URL，直接返回
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    // 如果是本地静态资源路径，直接返回
    if (imageUrl.startsWith('/static/') || imageUrl.startsWith('/photo/')) {
      return imageUrl
    }
    
    // 如果是相对路径，拼接基础地址
    if (imageUrl.startsWith('/')) {
      return `${this.imageBaseUrl}${imageUrl}`
    }
    
    // 如果只是文件名，拼接完整路径
    return `${this.imageBaseUrl}/${imageUrl}`
  }

  /**
   * 获取轮播图URL
   * @param {string} imageUrl - 原始图片URL
   * @returns {string} 处理后的图片URL
   */
  getBannerImageUrl(imageUrl) {
    return this.processImageUrl(imageUrl, 'banner')
  }

  /**
   * 获取环保成果图片URL
   * @param {string} imageUrl - 原始图片URL
   * @returns {string} 处理后的图片URL
   */
  getAchievementImageUrl(imageUrl) {
    return this.processImageUrl(imageUrl, 'achievement')
  }

  /**
   * 获取服务项目图片URL
   * @param {string} imageUrl - 原始图片URL
   * @returns {string} 处理后的图片URL
   */
  getServiceImageUrl(imageUrl) {
    return this.processImageUrl(imageUrl, 'service')
  }

  /**
   * 获取环境管理要求图片URL
   * @param {string} imageUrl - 原始图片URL
   * @returns {string} 处理后的图片URL
   */
  getEnvironmentalImageUrl(imageUrl) {
    return this.processImageUrl(imageUrl, 'environmental')
  }

  /**
   * 获取志愿活动图片URL
   * @param {string} imageUrl - 原始图片URL
   * @returns {string} 处理后的图片URL
   */
  getVolunteerImageUrl(imageUrl) {
    return this.processImageUrl(imageUrl, 'volunteer')
  }

  /**
   * 获取打卡地点图片URL
   * @param {string} imageUrl - 原始图片URL
   * @returns {string} 处理后的图片URL
   */
  getCheckinImageUrl(imageUrl) {
    return this.processImageUrl(imageUrl, 'checkin')
  }

  /**
   * 获取活动详情图片URL
   * @param {string} imageUrl - 原始图片URL
   * @returns {string} 处理后的图片URL
   */
  getActivityImageUrl(imageUrl) {
    return this.processImageUrl(imageUrl, 'activity')
  }

  /**
   * 处理图片加载错误
   * @param {Event} event - 图片加载错误事件
   * @param {string} fallbackType - 默认图片类型
   * @returns {string} 默认图片URL
   */
  handleImageError(event, fallbackType = 'default') {
    const fallbackUrl = this.defaultImages[fallbackType] || this.defaultImages.default
    if (event && event.target) {
      event.target.src = fallbackUrl
    }
    console.warn('图片加载失败，使用默认图片:', fallbackUrl)
    return fallbackUrl
  }

  /**
   * 预加载图片
   * @param {string} imageUrl - 图片URL
   * @returns {Promise} 预加载Promise
   */
  preloadImage(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(imageUrl)
      img.onerror = () => reject(new Error(`图片加载失败: ${imageUrl}`))
      img.src = imageUrl
    })
  }

  /**
   * 批量预加载图片
   * @param {Array} imageUrls - 图片URL数组
   * @returns {Promise} 预加载Promise
   */
  preloadImages(imageUrls) {
    const promises = imageUrls.map(url => this.preloadImage(url))
    return Promise.allSettled(promises)
  }

  /**
   * 检查图片是否存在
   * @param {string} imageUrl - 图片URL
   * @returns {Promise<boolean>} 图片是否存在
   */
  async checkImageExists(imageUrl) {
    try {
      await this.preloadImage(imageUrl)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取图片尺寸
   * @param {string} imageUrl - 图片URL
   * @returns {Promise<{width: number, height: number}>} 图片尺寸
   */
  getImageSize(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.onerror = () => reject(new Error(`无法获取图片尺寸: ${imageUrl}`))
      img.src = imageUrl
    })
  }

  /**
   * 压缩图片质量（用于上传）
   * @param {File} file - 图片文件
   * @param {number} quality - 压缩质量 (0-1)
   * @param {number} maxWidth - 最大宽度
   * @returns {Promise<Blob>} 压缩后的图片
   */
  compressImage(file, quality = 0.8, maxWidth = 1200) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 生成缩略图
   * @param {string} imageUrl - 原图URL
   * @param {number} width - 缩略图宽度
   * @param {number} height - 缩略图高度
   * @returns {string} 缩略图URL
   */
  generateThumbnail(imageUrl, width = 200, height = 200) {
    // 如果是API图片，可以添加缩略图参数
    if (imageUrl.includes(this.imageBaseUrl)) {
      return `${imageUrl}?w=${width}&h=${height}&fit=crop`
    }
    return imageUrl
  }
}

// 创建实例
const imageUtils = new ImageUtils()

// 导出实例和类
export default imageUtils
export { ImageUtils }

// 导出常用方法
export const {
  processImageUrl,
  getBannerImageUrl,
  getAchievementImageUrl,
  getServiceImageUrl,
  getEnvironmentalImageUrl,
  getVolunteerImageUrl,
  getCheckinImageUrl,
  getActivityImageUrl,
  handleImageError,
  preloadImage,
  preloadImages,
  checkImageExists,
  getImageSize,
  compressImage,
  generateThumbnail
} = imageUtils
