import request from '@/utils/request.js'

// ========== 首页公开接口 ==========

/** 获取轮播图 */
export function getBanners() {
  return request.get('/app/banners')
}

/** 获取服务分类 */
export function getCategories() {
  return request.get('/app/categories')
}

/** 获取分类详情（含内容，可选认证） */
export function getCategoryDetail(id) {
  // 如果已登录则自动携带token，后端会据此判断是否解锁付费内容
  const token = uni.getStorageSync('token')
  return request.get(`/app/categories/${id}`, !!token)
}

/** 获取分类下的内容标题列表 */
export function getCategoryContents(categoryId) {
  return request.get(`/app/categories/${categoryId}/contents`)
}

/** 获取分类下子级的内容标题（一次返回子分类+内容摘要，用于 service-detail 列表页） */
export function getCategoryChildrenContents(categoryId) {
  return request.get(`/app/categories/${categoryId}/children-contents`)
}

/** 获取步骤导航信息（L3兄弟节点列表） */
export function getStepNavigation(categoryId) {
  return request.get(`/app/categories/${categoryId}/steps`)
}

/** 获取内容条目详情（可选认证） */
export function getCategoryContentDetail(id) {
  const token = uni.getStorageSync('token')
  return request.get(`/app/category-contents/${id}`, !!token)
}

/** 安全下载内容文件（需认证+已购买） */
export function downloadContentFile(id) {
  return request.get(`/app/category-contents/${id}/download`, true)
}

/** 安全下载分类文件（需认证+已购买） */
export function downloadCategoryFile(id) {
  return request.get(`/app/categories/${id}/download`, true)
}

/** 获取第三方服务链接 */
export function getThirdPartyLinks() {
  return request.get('/app/third-party-links')
}

/** 获取关于我们 */
export function getAbout() {
  return request.get('/app/about')
}

/** 获取平台统计数据 */
export function getPlatformStats() {
  return request.get('/app/stats')
}

/** 获取协议内容 (type: user | privacy) */
export function getAgreement(type) {
  return request.get(`/app/agreement/${type}`)
}

// ========== 认证接口 ==========

/** 发送短信验证码 */
export function sendSmsCode(data) {
  return request.post('/app/auth/send-code', data)
}

/** 手机号+验证码登录 */
export function login(data) {
  return request.post('/app/auth/login', data)
}

/** 微信小程序一键登录（code: wx.login 获取, phoneCode: getPhoneNumber 获取） */
export function wxLogin(code, phoneCode) {
  return request.post('/app/auth/wx-login', { code, phoneCode })
}

/** 获取个人资料 */
export function getProfile() {
  return request.get('/app/auth/profile', true)
}

/** 更新个人资料 */
export function updateProfile(data) {
  return request.put('/app/auth/profile', data, true)
}

/** 企业注册 */
export function registerEnterprise(data) {
  return request.post('/app/auth/enterprise', data, true)
}

/** 登出 */
export function logout() {
  return request.post('/app/auth/logout', {}, true)
}

// ========== 内容接口 ==========

/** 获取服务列表 */
export function getServiceItems(params) {
  const qs = params ? '?' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&') : ''
  return request.get(`/app/services${qs}`)
}

/** 获取服务详情 */
export function getServiceDetail(id) {
  return request.get(`/app/services/${id}`)
}

/** 获取内容列表 */
export function getContentList(params) {
  const qs = params ? '?' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&') : ''
  return request.get(`/app/contents${qs}`)
}

/** 获取内容详情 */
export function getContentDetail(id) {
  return request.get(`/app/contents/${id}`)
}

/** 发表评论 */
export function postComment(contentId, content) {
  return request.post(`/app/contents/${contentId}/comment`, { content }, true)
}

/** 获取咨询配置（含免费咨询时长） */
export function getConsultationConfig() {
  return request.get('/app/consultation/config')
}

/** 领取免费咨询 */
export function claimFreeConsultation() {
  return request.post('/app/consultation/claim-free', {}, true)
}

/** 结束免费咨询（计算用时） */
export function endFreeConsultation(consultationId) {
  return request.post(`/app/consultation/${consultationId}/end-free`, {}, true)
}

// ========== 订单接口 ==========

/** 创建订单 */
export function createOrder(data) {
  return request.post('/app/orders', data, true)
}

/** 获取订单列表 */
export function getOrders(params) {
  const qs = params ? '?' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&') : ''
  return request.get(`/app/orders${qs}`, true)
}

/** 获取订单详情 */
export function getOrderDetail(id) {
  return request.get(`/app/orders/${id}`, true)
}

/** 取消订单 */
export function cancelOrder(id) {
  return request.post(`/app/orders/${id}/cancel`, {}, true)
}

/** 申请退款 */
export function refundOrder(id) {
  return request.post(`/app/orders/${id}/refund`, {}, true)
}

/** 支付订单（模拟支付，保留兼容） */
export function payOrder(id) {
  return request.post(`/app/orders/${id}/pay`, {}, true)
}

/** 发起真实支付（获取前端调起参数） */
export function prepayOrder(orderId, payMethod) {
  return request.post(`/app/orders/${orderId}/prepay`, { payMethod: payMethod || 'wechat' }, true)
}

/** 统一支付调起（微信小程序） */
export async function invokePayment(orderId) {
  // 1. 调用 prepay 获取支付参数
  const res = await prepayOrder(orderId, 'wechat')
  if (!res || !res.payParams) {
    throw new Error('获取支付参数失败')
  }

  // 2. 调起微信支付
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: res.payParams.timeStamp,
      nonceStr: res.payParams.nonceStr,
      package: res.payParams.package,
      signType: res.payParams.signType || 'RSA',
      paySign: res.payParams.paySign,
      success: () => resolve(res),
      fail: (err) => reject(err)
    })
  })
}

// ========== 会员接口 ==========

/** 获取会员方案列表 */
export function getMembershipTiers() {
  return request.get('/app/membership/tiers')
}

/** 获取我的订阅 */
export function getMySubscription() {
  return request.get('/app/membership/subscription', true)
}

/** 购买/升级会员（创建订单） */
export function purchaseMembership(tierId) {
  return request.post('/app/membership/purchase', { tierId }, true)
}

/** 获取会员配额使用情况 */
export function getMembershipQuota() {
  return request.get('/app/membership/quota', true)
}

/** 兑换码兑换会员 */
export function redeemCode(code) {
  return request.post('/app/membership/redeem', { code }, true)
}

/** 创建礼品码订单 */
export function createGiftOrder(tierId, quantity) {
  return request.post('/app/membership/gift-order', { tierId, quantity }, true)
}

/** 我的礼品码订单列表 */
export function getMyGiftOrders() {
  return request.get('/app/membership/gift-orders', true)
}

/** 礼品订单下的兑换码 */
export function getGiftOrderCodes(orderId) {
  return request.get(`/app/membership/gift-orders/${orderId}/codes`, true)
}

// ========== 咨询接口 ==========

/** 检查人工咨询资格 */
export function checkConsultationEligibility() {
  return request.get('/app/consultation/eligibility', true)
}

/** 获取微信客服账号列表 */
export function getWechatKfAccounts(category) {
  let qs = ''
  if (category) qs = '?category=' + encodeURIComponent(category)
  return request.get('/app/wechat-kf' + qs)
}

/** 创建咨询 */
export function createConsultation(data) {
  return request.post('/app/consultations', data, true)
}

/** 获取咨询列表 */
export function getConsultationList() {
  return request.get('/app/consultations', true)
}

/** 获取咨询消息 */
export function getConsultationMessages(id) {
  return request.get(`/app/consultations/${id}/messages`, true)
}

/** 发送消息 */
export function sendMessage(id, content) {
  return request.post(`/app/consultations/${id}/messages`, { content }, true)
}

// ========== 工具接口 ==========

/** 个税计算 */
export function calculateTax(data) {
  return request.post('/app/tools/tax-calculator', data)
}

/** 知识库搜索 */
export function searchQA(keyword) {
  return request.get(`/app/tools/qa-search?keyword=${encodeURIComponent(keyword)}`)
}

/** 获取热门问题 */
export function getQuickQuestions() {
  return request.get('/app/tools/faq')
}

/** 获取智能问答聊天记录 */
export function getQAChatHistory(limit, offset) {
  let qs = '?limit=' + (limit || 50)
  if (offset) qs += '&offset=' + offset
  return request.get('/app/qa-chat' + qs, true)
}

/** 批量保存智能问答聊天记录 */
export function saveQAChatMessages(messages) {
  return request.post('/app/qa-chat/save', { messages }, true)
}

// ========== 用户中心接口 ==========

/** 上传文件（头像等） */
export function uploadFile(filePath, module) {
  const BASE_URL = 'http://localhost:8070/api/v1'
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + '/app/upload',
      filePath: filePath,
      name: 'file',
      formData: { module: module || 'avatar' },
      header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (e) {
          reject(new Error('响应解析失败'))
        }
      },
      fail: (err) => {
        reject(new Error('上传失败'))
      }
    })
  })
}

/** 获取浏览历史 */
export function getBrowseHistory(page, pageSize) {
  const qs = '?page=' + (page || 1) + '&pageSize=' + (pageSize || 20)
  return request.get('/app/history' + qs, true)
}

/** 清空浏览历史 */
export function clearBrowseHistory() {
  return request.del('/app/history', true)
}

/** 获取收藏列表 */
export function getFavorites(page, pageSize) {
  const qs = '?page=' + (page || 1) + '&pageSize=' + (pageSize || 20)
  return request.get('/app/favorites' + qs, true)
}

/** 添加收藏 */
export function addFavorite(data) {
  return request.post('/app/favorites', data, true)
}

/** 移除收藏 */
export function removeFavorite(id) {
  return request.del(`/app/favorites/${id}`, true)
}

/** 获取通知列表 */
export function getNotifications() {
  return request.get('/app/notifications', true)
}

/** 标记通知已读 */
export function readNotification(id) {
  return request.post(`/app/notifications/${id}/read`, {}, true)
}

// ========== 模板下载接口 ==========

/** 获取模板列表（可选认证，已登录自动携带token） */
export function getTemplates(keyword) {
  const token = uni.getStorageSync('token')
  const qs = keyword ? '?keyword=' + encodeURIComponent(keyword) : ''
  return request.get(`/app/templates${qs}`, !!token)
}

/** 安全下载模板文件（需认证+已购买） */
export function downloadTemplate(id) {
  return request.get(`/app/templates/${id}/download`, true)
}

// ========== 问卷接口 ==========

/** 获取问卷（含题目和选项） */
export function getQuestionnaire(id) {
  return request.get(`/app/questionnaires/${id}`)
}

/** 根据分类ID获取问卷 */
export function getQuestionnaireByCategory(categoryId) {
  return request.get(`/app/categories/${categoryId}/questionnaire`)
}

/** 提交问卷答案 */
export function submitQuestionnaire(id, answers) {
  return request.post(`/app/questionnaires/${id}/submit`, { answers }, true)
}

/** 获取付费选项配置 */
export function getPayOptions(questionnaireId) {
  return request.get(`/app/questionnaires/${questionnaireId}/pay-options`)
}

/** 创建报告订单 */
export function createReportOrder(questionnaireId, answerId, reportType) {
  return request.post(`/app/questionnaires/${questionnaireId}/create-report-order`, { answerId, reportType }, true)
}

/** 获取报告详情 */
export function getReport(id) {
  return request.get(`/app/questionnaire-reports/${id}`, true)
}

/** 获取我的报告列表 */
export function getMyReports() {
  return request.get('/app/my-reports', true)
}

// ========== OCR 文档解析接口 ==========

/** 上传文件并 OCR 解析（使用 uni.uploadFile） */
export function uploadAndOCR(filePath, fileName) {
  const BASE_URL = 'http://localhost:8070/api/v1'
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + '/app/ocr/parse',
      filePath: filePath,
      name: 'file',
      formData: fileName ? { fileName: fileName } : {},
      header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '解析失败'))
          }
        } catch (e) {
          reject(new Error('响应解析失败'))
        }
      },
      fail: (err) => {
        reject(new Error('上传失败'))
      }
    })
  })
}
