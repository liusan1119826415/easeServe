<template>
  <view class="page">
    <scroll-view class="content-area" scroll-y>
      <view class="content-inner">
      <!-- 客服状态卡片 -->
      <view class="status-card">
        <view class="status-icon-wrap">
          <text class="status-icon">🎧</text>
        </view>
        <view class="status-info">
          <text class="status-title">{{ kfName || (category || '专项') + '客服' }}</text>
          <text class="status-desc">专业顾问在线，为您提供一对一服务</text>
          <text v-if="isFreeConsult" class="free-timer-text">
            免费咨询 · 已用 {{ elapsedMinutes }} 分钟 · 剩余 {{ remainingMinutes }} 分钟
          </text>
        </view>
        <view class="status-badge">
          <view class="badge-dot"></view>
          <text class="badge-text">在线</text>
        </view>
      </view>

      <!-- 结束免费咨询按钮 -->
      <view v-if="isFreeConsult && consultationId" class="end-consult-bar">
        <view class="end-consult-btn" @tap="endConsult">
          <text>结束咨询（已用 {{ elapsedMinutes }} 分钟）</text>
        </view>
      </view>

      <!-- 微信客服入口（企业微信） -->
      <view class="chat-entry" v-if="openKfid">
        <view class="contact-btn" @tap="openKfChatWindow">
          <view class="btn-content">
            <text class="btn-icon">💬</text>
            <view class="btn-text-wrap">
              <text class="btn-main">开始咨询</text>
              <text class="btn-sub">点击打开企业微信客服窗口</text>
            </view>
            <text class="btn-arrow">→</text>
          </view>
        </view>
      </view>
      <!-- 无 open_kfid 时的通用入口 -->
      <view class="chat-entry" v-else>
        <button class="contact-btn" open-type="contact" :session-from="'专项客服-' + (category || '通用')">
          <view class="btn-content">
            <text class="btn-icon">💬</text>
            <view class="btn-text-wrap">
              <text class="btn-main">开始咨询</text>
              <text class="btn-sub">点击打开客服聊天窗口</text>
            </view>
            <text class="btn-arrow">→</text>
          </view>
        </button>
      </view>

      <!-- 分隔线 -->
      <view class="section-divider">
        <view class="divider-line"></view>
        <text class="divider-text">文件解析工具</text>
        <view class="divider-line"></view>
      </view>

      <!-- OCR 文件上传区 -->
      <view class="ocr-section">
        <view class="ocr-header">
          <text class="ocr-title">📄 文档/图片智能识别</text>
          <text class="ocr-desc">上传 PDF、Word 文档或图片，自动提取文字内容并发送到客服会话</text>
        </view>

        <view v-if="!ocrResult" class="ocr-upload-area" @tap="chooseFile">
          <view v-if="!uploading" class="upload-placeholder">
            <view class="upload-icon-wrap">
              <text class="upload-icon">⬆️</text>
            </view>
            <text class="upload-text">点击选择文件或图片</text>
            <text class="upload-hint">支持 PDF / Word / JPG / PNG</text>
          </view>

          <!-- 上传中 -->
          <view v-if="uploading" class="upload-loading">
            <view class="loading-spinner"></view>
            <text class="loading-text">正在上传并解析文档...</text>
            <text class="loading-hint">AI 正在识别文档内容，请耐心等待</text>
          </view>
        </view>

        <!-- OCR 结果展示 -->
        <view v-if="ocrResult" class="ocr-result-card">
          <view class="result-file-info">
            <text class="file-icon">📋</text>
            <view class="file-detail">
              <text class="file-name">{{ ocrResult.fileName }}</text>
              <text class="file-meta">{{ ocrResult.charCount }} 字已提取</text>
            </view>
          </view>

          <view class="result-text-wrap">
            <text class="result-label">提取内容：</text>
            <scroll-view class="result-text-scroll" scroll-y>
              <text class="result-text">{{ ocrResult.ocrText }}</text>
            </scroll-view>
          </view>

          <view class="result-status">
            <view v-if="ocrResult.pushStatus === 'pushed'" class="status-success">
              <text class="status-icon-small">✅</text>
              <text class="status-text-ok">已自动发送到客服会话</text>
            </view>
            <view v-else-if="ocrResult.pushStatus === 'push_failed'" class="status-warn">
              <text class="status-icon-small">⚠️</text>
              <text class="status-text-warn">发送客服失败，请手动复制后发送</text>
            </view>
            <view v-else class="status-info-tip">
              <text class="status-icon-small">ℹ️</text>
              <text class="status-text-info">请打开客服会话后手动发送提取内容</text>
            </view>
          </view>

          <view class="result-actions">
            <view class="action-copy" @tap="copyOcrText">
              <text>📋 复制文本</text>
            </view>
            <view class="action-chat" @tap="openKfChatWindow">
              <text>💬 去客服会话</text>
            </view>
            <view class="action-retry" @tap="chooseFile">
              <text>🔄 重新上传</text>
            </view>
          </view>
        </view>

        <!-- 解析错误提示 -->
        <view v-if="ocrError" class="ocr-error-card">
          <text class="error-icon">❌</text>
          <text class="error-text">{{ ocrError }}</text>
          <view class="error-retry" @tap="chooseFile">
            <text>重新上传</text>
          </view>
        </view>
      </view>

      <!-- OCR 快捷分类 -->
      <view class="ocr-quick-grid">
        <view class="quick-item" v-for="(item, idx) in ocrItems" :key="idx" @tap="chooseFile">
          <view class="quick-icon-wrap">
            <text class="quick-icon">{{ item.icon }}</text>
          </view>
          <text class="quick-name">{{ item.name }}</text>
        </view>
      </view>

      <view style="height: 40px;"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { uploadAndOCR, getConsultationConfig, endFreeConsultation } from '@/api/index.js'

export default {
  data() {
    return {
      openKfid: '',
      kfName: '',
      category: '',
      serviceCategory: '',
      consultPrice: 0,
      consultDuration: 0,
      uploading: false,
      ocrResult: null,
      ocrError: '',
      isFreeConsult: false,
      consultationId: 0,
      freeStartAt: null,
      elapsedMinutes: 0,
      remainingMinutes: 0,
      timer: null,
      ocrItems: [
        { name: '保单', icon: '🛡️' },
        { name: '合同', icon: '📄' },
        { name: '仲裁文书', icon: '⚖️' },
        { name: '拍照识别', icon: '📷' },
        { name: '其他文件', icon: '📁' }
      ]
    }
  },
  onLoad(options) {
    // 未登录跳转登录页
    const token = uni.getStorageSync('token')
    if (!token) {
      const query = Object.keys(options).map(k => k + '=' + options[k]).join('&')
      const redirectUrl = '/pages/support-chat/index' + (query ? '?' + query : '')
      uni.redirectTo({
        url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl),
        fail: () => uni.reLaunch({ url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl) })
      })
      return
    }

    // 企业微信客服参数
    if (options.openKfid) {
      this.openKfid = decodeURIComponent(options.openKfid)
    }
    if (options.kfName) {
      this.kfName = decodeURIComponent(options.kfName)
    }
    if (options.category || options.serviceCategory) {
      this.category = decodeURIComponent(options.category || options.serviceCategory)
      this.serviceCategory = this.category
    }
    if (options.consultPrice) {
      this.consultPrice = parseFloat(options.consultPrice)
    }
    if (options.consultDuration) {
      this.consultDuration = parseInt(options.consultDuration)
    }
    if (options.consultationId) {
      this.consultationId = parseInt(options.consultationId)
      this.isFreeConsult = true
      this.freeStartAt = new Date()
      this.startTimer()
    }
    this.loadFreeMinutes()
  },
  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    /** 打开企业微信客服聊天窗口 */
    openKfChatWindow() {
      // #ifdef MP-WEIXIN
      if (this.openKfid) {
        wx.openCustomerServiceChat({
          extInfo: {
            url: ''
          },
          corpId: '',
          showMessageCard: true,
          sendMsgTitle: this.category || this.serviceCategory || '咨询',
          sendMsgPath: '/pages/index/index',
          sendMsgImg: '',
          success: () => {
            console.log('企业微信客服窗口打开成功')
          },
          fail: (err) => {
            console.error('打开企业微信客服失败:', err)
            uni.showToast({ title: '打开客服失败，请重试', icon: 'none' })
          }
        })
      } else {
        // 兜底：没有 open_kfid 时用小程序原生客服
        uni.showToast({ title: '请通过上一步选择客服接入', icon: 'none' })
      }
      // #endif
      // #ifndef MP-WEIXIN
      uni.showToast({ title: '请在微信小程序中使用客服功能', icon: 'none' })
      // #endif
    },

    callSupport() {
      uni.makePhoneCall({ phoneNumber: '0731-XXXXXXX' })
    },

    /** 选择文件（微信小程序从聊天记录中选择） */
    chooseFile() {
      const self = this
      // #ifdef MP-WEIXIN
      uni.showActionSheet({
        itemList: ['从聊天记录选择文件', '拍照识别文字', '从相册选择图片'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.chooseMessageFile({
              count: 1,
              type: 'file',
              extension: ['.pdf', '.doc', '.docx'],
              success: (fileRes) => {
                if (fileRes.tempFiles && fileRes.tempFiles.length > 0) {
                  self.uploadAndParse(fileRes.tempFiles[0])
                }
              }
            })
          } else if (res.tapIndex === 1) {
            uni.chooseImage({
              count: 1,
              sourceType: ['camera'],
              success: (imgRes) => {
                self.uploadAndParse({ path: imgRes.tempFilePaths[0], name: 'camera.jpg' })
              }
            })
          } else if (res.tapIndex === 2) {
            uni.chooseImage({
              count: 1,
              sourceType: ['album'],
              success: (imgRes) => {
                self.uploadAndParse({ path: imgRes.tempFilePaths[0], name: 'album.jpg' })
              }
            })
          }
        }
      })
      // #endif
      // #ifndef MP-WEIXIN
      uni.chooseFile({
        count: 1,
        type: 'file',
        extension: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.bmp'],
        success: (res) => {
          if (res.tempFiles && res.tempFiles.length > 0) {
            self.uploadAndParse(res.tempFiles[0])
          }
        },
        fail: () => {
          uni.showToast({ title: '请选择 PDF / Word / 图片文件', icon: 'none' })
        }
      })
      // #endif
    },

    /** 上传文件并 OCR 解析 */
    async uploadAndParse(file) {
      this.uploading = true
      this.ocrResult = null
      this.ocrError = ''

      try {
        let fileName = file.name
        if (!fileName && file.path) {
          const pathParts = file.path.split('/')
          fileName = pathParts[pathParts.length - 1]
        }
        if (!fileName) fileName = 'unknown.jpg'

        const result = await uploadAndOCR(file.path, fileName)
        this.ocrResult = result
        if (result.ocrError) {
          this.ocrError = result.ocrError
        }
      } catch (e) {
        this.ocrError = e.message || '文档解析失败，请稍后重试'
        uni.showToast({ title: '解析失败', icon: 'none' })
      } finally {
        this.uploading = false
      }
    },

    /** 复制 OCR 文本 */
    copyOcrText() {
      if (!this.ocrResult || !this.ocrResult.ocrText) return
      uni.setClipboardData({
        data: this.ocrResult.ocrText,
        success: () => {
          uni.showToast({ title: '已复制', icon: 'success' })
        }
      })
    },

    /** 加载免费分钟信息 */
    async loadFreeMinutes() {
      try {
        const res = await getConsultationConfig()
        if (res) {
          this.remainingMinutes = Math.floor(res.freeMinutesRemaining || 0)
        }
      } catch (e) {
        // 静默
      }
    },

    /** 启动计时器 */
    startTimer() {
      this.timer = setInterval(() => {
        if (this.freeStartAt) {
          const now = new Date()
          this.elapsedMinutes = Math.floor((now - this.freeStartAt) / 60000)
        }
      }, 10000)
    },

    /** 结束免费咨询 */
    async endConsult() {
      if (!this.consultationId) return
      uni.showModal({
        title: '结束咨询',
        content: `确定要结束本次免费咨询吗？已用约 ${this.elapsedMinutes} 分钟。`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await endFreeConsultation(this.consultationId)
              uni.showToast({ title: '咨询已结束', icon: 'success' })
              if (this.timer) clearInterval(this.timer)
              this.isFreeConsult = false
              setTimeout(() => {
                uni.navigateBack()
              }, 1000)
            } catch (e) {
              // 错误已提示
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-surface, #f2f3f5); }

.content-area { height: 100vh; padding-top: 16px; box-sizing: border-box; }
.content-inner { padding: 0 16px; box-sizing: border-box; }

/* 客服状态卡片 */
.status-card {
  display: flex; align-items: center; gap: 16px;
  background: #fff; border-radius: 16px; padding: 24px;
  margin-bottom: 16px;
  border: 1px solid var(--color-outline-variant, rgba(196,198,208,0.3));
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.status-icon-wrap {
  width: 52px; height: 52px; border-radius: 16px;
  background: rgba(0,95,184,0.08);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.status-icon { font-size: 26px; }
.status-info { flex: 1; }
.status-title { font-size: 16px; font-weight: 700; color: var(--color-on-surface, #1B1C1E); display: block; }
.status-desc { font-size: 12px; color: var(--color-on-surface-variant, #565F71); margin-top: 2px; }
.status-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 12px;
  background: rgba(0,168,107,0.1);
}
.badge-dot { width: 8px; height: 8px; border-radius: 4px; background: #00A86B; }
.badge-text { font-size: 12px; font-weight: 600; color: #00A86B; }

/* 客服入口按钮 */
.chat-entry { margin-bottom: 24px; }
.contact-btn {
  width: 100%; background: var(--color-primary, #005FB8);
  border: none; border-radius: 16px;
  padding: 0; margin: 0;
  line-height: normal;
}
.contact-btn::after { border: none; }
.btn-content {
  display: flex; align-items: center; gap: 16px;
  padding: 20px 24px;
}
.btn-icon { font-size: 28px; }
.btn-text-wrap { flex: 1; text-align: left; }
.btn-main { font-size: 18px; font-weight: 700; color: #fff; display: block; }
.btn-sub { font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 2px; }
.btn-arrow { font-size: 20px; color: rgba(255,255,255,0.8); }

/* 分隔线 */
.section-divider {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 24px;
}
.divider-line { flex: 1; height: 1px; background: var(--color-outline-variant, rgba(196,198,208,0.3)); }
.divider-text { font-size: 12px; color: var(--color-secondary, #565F71); font-weight: 600; letter-spacing: 1px; white-space: nowrap; }

/* OCR 区域 */
.ocr-section { margin-bottom: 24px; }
.ocr-header { margin-bottom: 16px; }
.ocr-title { font-size: 16px; font-weight: 700; color: var(--color-on-surface, #1B1C1E); display: block; }
.ocr-desc { font-size: 12px; color: var(--color-on-surface-variant, #565F71); margin-top: 4px; display: block; }

.ocr-upload-area {
  background: #fff; border-radius: 16px;
  border: 2px dashed var(--color-outline-variant, rgba(196,198,208,0.5));
  min-height: 140px; display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.ocr-upload-area:active { border-color: var(--color-primary, #005FB8); }

.upload-placeholder { text-align: center; padding: 24px; }
.upload-icon-wrap {
  width: 56px; height: 56px; border-radius: 28px;
  background: rgba(0,95,184,0.08);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.upload-icon { font-size: 24px; }
.upload-text { font-size: 16px; font-weight: 600; color: var(--color-primary, #005FB8); display: block; }
.upload-hint { font-size: 12px; color: var(--color-on-surface-variant, #565F71); margin-top: 4px; }

.upload-loading { text-align: center; padding: 24px; }
.loading-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid rgba(0,95,184,0.2);
  border-top-color: var(--color-primary, #005FB8);
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 14px; font-weight: 600; color: var(--color-on-surface, #1B1C1E); display: block; }
.loading-hint { font-size: 12px; color: var(--color-on-surface-variant, #565F71); margin-top: 4px; }

.ocr-result-card {
  background: #fff; border-radius: 16px; padding: 20px;
  border: 1px solid var(--color-outline-variant, rgba(196,198,208,0.3));
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 16px;
}
.result-file-info {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 1px solid var(--color-outline-variant, rgba(196,198,208,0.3));
}
.file-icon { font-size: 28px; }
.file-detail { flex: 1; }
.file-name { font-size: 14px; font-weight: 600; color: var(--color-on-surface, #1B1C1E); display: block; }
.file-meta { font-size: 12px; color: var(--color-primary, #005FB8); }

.result-text-wrap { margin-bottom: 16px; }
.result-label { font-size: 12px; font-weight: 600; color: var(--color-secondary, #565F71); display: block; margin-bottom: 8px; }
.result-text-scroll {
  max-height: 200px; padding: 12px;
  background: var(--color-surface, #f9f9ff); border-radius: 8px;
  border: 1px solid var(--color-outline-variant, rgba(196,198,208,0.2));
}
.result-text { font-size: 13px; color: var(--color-on-surface, #1B1C1E); line-height: 1.7; white-space: pre-wrap; word-break: break-all; }

.result-status { margin-bottom: 16px; }
.status-success, .status-warn, .status-info-tip {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 8px;
}
.status-success { background: rgba(0,168,107,0.08); }
.status-warn { background: rgba(255,152,0,0.08); }
.status-info-tip { background: rgba(0,95,184,0.06); }
.status-icon-small { font-size: 14px; }
.status-text-ok { font-size: 13px; color: #00A86B; font-weight: 600; }
.status-text-warn { font-size: 13px; color: #FF9800; font-weight: 600; }
.status-text-info { font-size: 13px; color: var(--color-primary, #005FB8); font-weight: 500; }

.result-actions { display: flex; gap: 8px; }
.action-copy, .action-retry, .action-chat {
  flex: 1; padding: 10px; border-radius: 10px;
  text-align: center; font-size: 13px; font-weight: 600;
}
.action-copy { background: var(--color-primary, #005FB8); color: #fff; }
.action-chat { background: #00A86B; color: #fff; }
.action-retry { background: var(--color-surface-container-low, #f0f2f5); color: var(--color-on-surface, #1B1C1E); border: 1px solid var(--color-outline-variant, rgba(196,198,208,0.3)); }

.ocr-error-card {
  background: #fff; border-radius: 16px; padding: 20px;
  border: 1px solid rgba(255,82,82,0.2); text-align: center;
  margin-bottom: 16px;
}
.error-icon { font-size: 28px; display: block; margin-bottom: 8px; }
.error-text { font-size: 14px; color: #FF5252; display: block; margin-bottom: 12px; }
.error-retry {
  display: inline-block; padding: 8px 24px; border-radius: 8px;
  background: var(--color-primary, #005FB8); color: #fff;
  font-size: 13px; font-weight: 600;
}

.ocr-quick-grid {
  display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;
}
.quick-item {
  width: calc(25% - 9px); background: #fff; border-radius: 12px; padding: 16px 8px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  border: 1px solid var(--color-outline-variant, rgba(196,198,208,0.3));
  box-sizing: border-box;
}
.quick-item:active { background: rgba(0,95,184,0.04); }
.quick-icon-wrap {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(0,95,184,0.06);
  display: flex; align-items: center; justify-content: center;
}
.quick-icon { font-size: 20px; }
.quick-name { font-size: 12px; font-weight: 500; color: var(--color-on-surface, #1B1C1E); }

.free-timer-text { font-size: 12px; color: var(--color-primary, #005FB8); font-weight: 600; display: block; margin-top: 4px; }
.end-consult-bar { margin-bottom: 16px; }
.end-consult-btn {
  background: #fff; border: 1px solid rgba(255,82,82,0.3); border-radius: 12px;
  padding: 12px 20px; text-align: center; font-size: 14px; color: #FF5252; font-weight: 600;
}
.end-consult-btn:active { background: rgba(255,82,82,0.05); }
</style>
