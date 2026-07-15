// API 请求封装
const BASE_URL = 'http://192.168.0.112:8070/api/v1'

/**
 * 发起请求
 * @param {Object} options - 请求参数
 * @param {string} options.url - 请求路径（相对路径，如 /app/banners）
 * @param {string} options.method - 请求方法 GET/POST/PUT/DELETE
 * @param {Object} options.data - 请求数据
 * @param {boolean} options.auth - 是否需要认证 token
 * @returns {Promise}
 */
function request(options) {
  const { url, method = 'GET', data = {}, auth = false } = options

  const header = {
    'Content-Type': 'application/json'
  }

  // 需要认证时自动携带 token
  if (auth) {
    const token = uni.getStorageSync('token')
    if (token) {
      header['Authorization'] = 'Bearer ' + token
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        const { statusCode, data: resData } = res
        if (statusCode === 200) {
          if (resData.code === 0) {
            resolve(resData.data)
          } else {
            uni.showToast({ title: resData.message || '请求失败', icon: 'none' })
            reject(new Error(resData.message || '请求失败'))
          }
        } else if (statusCode === 401) {
          // token 过期或无效，清除并跳转登录
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.showToast({ title: '请先登录', icon: 'none' })
          // 获取当前页面路径，登录后返回
          const pages = getCurrentPages()
          const current = pages[pages.length - 1]
          let currentPage = '/pages/index/index'
          if (current && current.route) {
            currentPage = '/' + current.route
            const opts = current.options || {}
            const qs = Object.keys(opts).map(k => k + '=' + opts[k]).join('&')
            if (qs) currentPage += '?' + qs
          }
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/login/index?redirect=' + encodeURIComponent(currentPage) })
          }, 1500)
          reject(new Error('未登录'))
        } else {
          const msg = res.data && res.data.message ? res.data.message : '服务器错误'
          uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误，请检查网络', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default {
  get(url, auth = false) {
    return request({ url, method: 'GET', auth })
  },
  post(url, data, auth = false) {
    return request({ url, method: 'POST', data, auth })
  },
  put(url, data, auth = false) {
    return request({ url, method: 'PUT', data, auth })
  },
  del(url, auth = false) {
    return request({ url, method: 'DELETE', auth })
  }
}
