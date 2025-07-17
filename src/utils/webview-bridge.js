/**
 * WebView桥接工具
 * 用于处理webview与外部页面的通信
 */

export default {
  /**
   * 注入到webview页面的脚本
   * 用于拦截链接点击和页面标题变化
   */
  getInjectedScript() {
    return `
      (function() {
        // 拦截所有链接点击
        document.addEventListener('click', function(e) {
          var target = e.target;
          
          // 查找最近的a标签
          while (target && target.tagName !== 'A') {
            target = target.parentElement;
          }
          
          if (target && target.href) {
            var href = target.href;
            
            // 如果是外部链接
            if (href.startsWith('http://') || href.startsWith('https://')) {
              // 阻止默认行为
              e.preventDefault();
              
              // 发送消息给小程序
              if (window.wx && window.wx.miniProgram) {
                window.wx.miniProgram.postMessage({
                  data: {
                    type: 'navigate',
                    url: href
                  }
                });
              }
              
              // 对于H5环境，直接打开新窗口
              if (typeof window !== 'undefined' && !window.wx) {
                window.open(href, '_blank');
              }
            }
          }
        });
        
        // 监听页面标题变化
        var titleObserver = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.target.tagName === 'TITLE') {
              var title = document.title;
              if (title && window.wx && window.wx.miniProgram) {
                window.wx.miniProgram.postMessage({
                  data: {
                    type: 'title',
                    title: title
                  }
                });
              }
            }
          });
        });
        
        // 开始观察title标签
        var titleElement = document.querySelector('title');
        if (titleElement) {
          titleObserver.observe(titleElement, {
            childList: true,
            subtree: true
          });
        }
        
        // 确保页面可以滚动
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        // 添加触摸滚动支持
        document.body.style.webkitOverflowScrolling = 'touch';
        document.documentElement.style.webkitOverflowScrolling = 'touch';
        
        // 发送页面加载完成消息
        if (window.wx && window.wx.miniProgram) {
          window.wx.miniProgram.postMessage({
            data: {
              type: 'loaded',
              title: document.title,
              url: window.location.href
            }
          });
        }
      })();
    `;
  },

  /**
   * 处理webview消息
   * @param {Object} event 消息事件
   * @param {Object} context Vue组件上下文
   */
  handleMessage(event, context) {
    const data = event.detail.data;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return;
    }

    const message = data[0];
    
    switch (message.type) {
      case 'title':
        if (message.title && context.pageTitle !== message.title) {
          context.pageTitle = message.title;
        }
        break;
        
      case 'navigate':
        if (message.url) {
          this.handleNavigation(message.url, context);
        }
        break;
        
      case 'loaded':
        console.log('WebView页面加载完成:', message);
        if (message.title && context.pageTitle === '详情') {
          context.pageTitle = message.title;
        }
        break;
        
      default:
        console.log('未知的WebView消息类型:', message.type);
    }
  },

  /**
   * 处理导航请求
   * @param {string} url 目标URL
   * @param {Object} context Vue组件上下文
   */
  handleNavigation(url, context) {
    // 验证URL
    if (!url || typeof url !== 'string') {
      return;
    }

    // 如果是外部链接，在新的webview中打开
    if (url.startsWith('http://') || url.startsWith('https://')) {
      uni.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent('外部链接')}`
      });
    }
    // 如果是相对链接，更新当前webview的URL
    else if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      // 构建完整URL
      const baseUrl = context.webviewUrl.split('?')[0].split('#')[0];
      const fullUrl = new URL(url, baseUrl).href;
      
      // 更新当前webview
      context.webviewUrl = fullUrl;
    }
  },

  /**
   * 获取webview样式配置
   */
  getWebviewStyles() {
    return {
      progress: {
        color: '#FE2741'
      },
      // 启用滚动
      scrollEnabled: true,
      // 启用缩放
      scalesPageToFit: true,
      // 启用用户交互
      userInteractionEnabled: true,
      // 允许内联播放
      allowsInlineMediaPlayback: true,
      // 允许AirPlay
      allowsAirPlayForMediaPlayback: true,
      // 允许图片保存
      allowsPictureInPictureMediaPlayback: true,
      // 允许链接预览
      allowsLinkPreview: true
    };
  },

  /**
   * 处理webview错误
   * @param {Object} event 错误事件
   * @param {Object} context Vue组件上下文
   */
  handleError(event, context) {
    console.error('WebView错误:', event.detail);
    
    const errorCode = event.detail.errCode || event.detail.code;
    let errorMessage = '无法加载此页面，请检查链接是否正确或稍后重试。';
    
    // 根据错误码提供更具体的错误信息
    switch (errorCode) {
      case -1:
        errorMessage = '网络连接失败，请检查网络设置。';
        break;
      case -2:
        errorMessage = '页面加载超时，请稍后重试。';
        break;
      case -3:
        errorMessage = '页面地址无效，请检查链接是否正确。';
        break;
      default:
        if (event.detail.errMsg) {
          errorMessage = event.detail.errMsg;
        }
    }
    
    context.error = errorMessage;
    context.loading = false;
  },

  /**
   * 处理webview加载完成
   * @param {Object} event 加载事件
   * @param {Object} context Vue组件上下文
   */
  handleLoad(event, context) {
    console.log('WebView加载完成:', event.detail);
    context.loading = false;
    context.error = '';
  }
};
