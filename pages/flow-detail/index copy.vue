<template>
  <view class="page-container">
    <!-- 封面图预览区 -->
    <view class="preview-section">
      <view class="dot-bg"></view>
      <view class="flow-card">
        <image v-if="coverImageUrl" class="flow-cover" :src="coverImageUrl" mode="aspectFill" />
        <view v-else class="flow-placeholder">
          <text class="flow-icon">{{ content.emoji || '📄' }}</text>
          <text class="flow-title">{{ content.title || content.categoryName || '内容详情' }}</text>
          <text class="flow-subtitle">{{ content.categoryName || '点击查看详情' }}</text>
        </view>
      </view>
      <view v-if="content.price > 0" class="preview-tags">
        <view class="price-badge">
          <text class="price-symbol">¥</text>
          <text class="price-amount">{{ content.price }}</text>
        </view>
      </view>
    </view>

    <!-- 底部详情区 -->
    <view class="detail-section">
      <text class="detail-h1">{{ content.title || '加载中...' }}</text>
      <text v-if="content.categoryName" class="detail-desc">{{ content.categoryName }}</text>

      <!-- 状态1: 付费锁定 + 富文本 → 截断预览 + 渐变遮罩 + 解锁卡片 -->
      <!-- 安全: previewContent 是后端截断50%后的HTML，richContent 未解锁时始终为空 -->
      <view v-if="isPaidLocked && contentTypeNum === 1 && previewContent" class="content-preview-area">
        <view class="preview-wrap">
          <rich-text :nodes="previewContent" class="rich-content preview-content" />
          <view class="preview-fade"></view>
        </view>
        <view class="locked-card">
          <text class="locked-icon">🔒</text>
          <text class="locked-title">解锁查看完整内容</text>
          <text class="locked-desc">该内容为付费专享，购买后即可查看完整内容</text>
          <view class="locked-price-tag">¥{{ content.price }}</view>
        </view>
      </view>

      <!-- 状态2: 付费锁定 + 文件类型 → 锁定卡片 -->
      <view v-else-if="isPaidLocked && contentTypeNum === 2" class="content-preview-area">
        <view class="locked-card">
          <text class="locked-icon">🔒</text>
          <text class="locked-title">付费文件</text>
          <text class="locked-desc">购买后可下载查看完整文件</text>
          <view class="locked-price-tag">¥{{ content.price }}</view>
        </view>
      </view>

      <!-- 状态3: 付费锁定 + 富文本但无预览(内容过短) → 锁定卡片 -->
      <view v-else-if="isPaidLocked" class="content-preview-area">
        <view class="locked-card">
          <text class="locked-icon">🔒</text>
          <text class="locked-title">付费内容</text>
          <text class="locked-desc">该内容为付费专享，购买后即可查看完整内容</text>
          <view class="locked-price-tag">¥{{ content.price }}</view>
        </view>
      </view>

      <!-- 状态4: 已解锁/免费 + 文件类型 → 下载卡片 -->
      <view v-else-if="contentTypeNum === 2 && (content.fileUrl || content.fileName)" class="content-preview-area">
        <view class="file-card" @tap="downloadFile">
          <view class="file-icon-wrap">
            <text class="file-icon">📄</text>
          </view>
          <view class="file-info">
            <text class="file-name">{{ content.fileName || '下载文件' }}</text>
            <text class="file-hint">点击下载查看完整内容</text>
          </view>
          <text class="file-arrow">↓</text>
        </view>
      </view>

      <!-- 状态5: 已解锁/免费 + 富文本 → 显示完整内容 -->
      <view v-else-if="content.richContent" class="content-preview-area">
        <rich-text :nodes="content.richContent" class="rich-content" />
      </view>

      <!-- 状态6: 无内容 -->
      <view v-else-if="!loading" class="content-preview-area">
        <view class="empty-content">
          <text class="empty-icon">📭</text>
          <text class="empty-text">暂无详细内容</text>
        </view>
      </view>

      <!-- 付费购买按钮 -->
      <view v-if="isPaidLocked" class="action-section">
        <view class="btn-primary-full" @tap="handlePay">
          <text>{{ content.priceLabel || '💰 付费查看完整流程 ¥' + content.price }}</text>
        </view>
      </view>

      <view class="action-section">
        <view class="btn-outline-full" @tap="goContact">
          <text>🎧 联系人工咨询（按次收费）</text>
        </view>
      </view>

      <!-- 信任指标 -->
      <view class="trust-bar">
        <view class="trust-item">
          <text class="trust-value primary-text">{{ stats.satisfaction }}</text>
          <text class="trust-label">用户好评度</text>
        </view>
        <view class="trust-item">
          <text class="trust-value">{{ stats.subscribedLabel }}</text>
          <text class="trust-label">已订阅企业</text>
        </view>
        <view class="trust-item trust-last">
          <text class="trust-value">{{ stats.version }}</text>
          <text class="trust-label">更新版本</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getCategoryContentDetail, getCategoryDetail, createOrder, payOrder, getPlatformStats } from '@/api/index.js'

const BASE_URL = 'http://localhost:8080'

export default {
  data() {
    return {
      contentId: 0,
      categoryId: 0,
      content: {},
      previewContent: '',
      loading: true,
      stats: {
        satisfaction: '4.8',
        subscribedLabel: '0',
        version: 'V2.4'
      }
    }
  },
  computed: {
    contentTypeNum() {
      return Number(this.content.contentType) || 0
    },
    isPaidLocked() {
      return this.content.price > 0
        && this.contentTypeNum > 0
        && !this.content.unlocked
    },
    coverImageUrl() {
      const img = this.content.coverImage
      if (!img) return ''
      if (img.startsWith('http://') || img.startsWith('https://')) return img
      return BASE_URL + img
    }
  },
  onLoad(options) {
    this.contentId = parseInt(options.contentId) || 0
    this.categoryId = parseInt(options.categoryId) || 0

    if (this.contentId) {
      this.loadContentDetail()
    } else if (this.categoryId) {
      this.loadCategoryContent()
    }

    // 加载平台统计（不阻塞主流程）
    this.loadStats()
  },
  methods: {
    /** 加载内容条目详情 */
    async loadContentDetail() {
      try {
        const res = await getCategoryContentDetail(this.contentId)
        if (res) {
          console.log('[flow-detail] API返回:', JSON.stringify({
            contentType: res.contentType,
            price: res.price,
            unlocked: res.unlocked,
            hasRichContent: !!res.richContent,
            hasPreviewContent: !!res.previewContent,
            isPreview: res.isPreview
          }))
          res.contentType = Number(res.contentType) || 0
          res.price = Number(res.price) || 0
          res.unlocked = !!res.unlocked
          this.content = res
          this.previewContent = res.previewContent || ''
          uni.setNavigationBarTitle({ title: res.title || '内容详情' })
        }
      } catch (e) {
        console.error('加载内容失败:', e)
      } finally {
        this.loading = false
      }
    },

    /** 旧流程兼容：通过分类ID加载 */
    async loadCategoryContent() {
      try {
        const res = await getCategoryDetail(this.categoryId)
        if (res) {
          res.contentType = Number(res.contentType) || 0
          res.price = Number(res.price) || 0
          res.unlocked = !!res.unlocked
          this.content = res
          this.previewContent = res.previewContent || ''
          uni.setNavigationBarTitle({ title: res.name || '流程详情' })
        }
      } catch (e) {
        console.error('加载内容失败:', e)
      } finally {
        this.loading = false
      }
    },

    /** 下载文件 */
    downloadFile() {
      if (!this.content.unlocked && this.content.price > 0) {
        uni.showToast({ title: '请先购买后再查看', icon: 'none' })
        return
      }

      const token = uni.getStorageSync('token')
      const header = {}
      if (token) {
        header['Authorization'] = 'Bearer ' + token
      }

      // 根据是否有contentId选择下载接口
      const downloadId = this.contentId || this.categoryId
      const downloadPath = this.contentId
        ? '/api/v1/app/category-contents/' + downloadId + '/download'
        : '/api/v1/app/categories/' + downloadId + '/download'

      uni.showLoading({ title: '下载中...' })
      uni.downloadFile({
        url: BASE_URL + downloadPath,
        header: header,
        success: (res) => {
          uni.hideLoading()
          if (res.statusCode === 200) {
            uni.openDocument({
              filePath: res.tempFilePath,
              showMenu: true,
              fail: () => {
                uni.showToast({ title: '无法打开文件', icon: 'none' })
              }
            })
          } else if (res.statusCode === 403) {
            uni.showToast({ title: '请先购买后再查看', icon: 'none' })
          } else {
            uni.showToast({ title: '下载失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '下载失败', icon: 'none' })
        }
      })
    },

    /** 付费购买 */
    async handlePay() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          const cur = getCurrentPages().pop()
          const p = '/' + cur.route + (cur.options.contentId ? '?contentId=' + cur.options.contentId : '')
          uni.navigateTo({ url: '/pages/login/index?redirect=' + encodeURIComponent(p) })
        }, 1500)
        return
      }

      const itemId = this.contentId || this.categoryId
      const itemTitle = this.content.title || this.content.name || '内容'

      try {
        const orderData = {
          orderType: 1,
          title: '购买: ' + itemTitle,
          amount: this.content.price,
          items: [{
            itemType: 4,
            itemId: itemId,
            name: itemTitle,
            price: this.content.price,
            quantity: 1
          }]
        }

        uni.showLoading({ title: '创建订单...' })
        const orderRes = await createOrder(orderData)

        uni.showLoading({ title: '支付中...' })
        await payOrder(orderRes.orderId)

        uni.hideLoading()
        uni.showToast({ title: '购买成功', icon: 'success' })

        // 重新加载内容
        if (this.contentId) {
          await this.loadContentDetail()
        } else {
          await this.loadCategoryContent()
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '支付失败: ' + (e.message || ''), icon: 'none' })
      }
    },

    goContact() {
      uni.navigateTo({ url: '/pages/select-support/index' })
    },

    /** 加载平台统计数据 */
    async loadStats() {
      try {
        const res = await getPlatformStats()
        if (res) {
          const count = Number(res.subscribedCount) || 0
          this.stats = {
            satisfaction: (Number(res.satisfaction) || 4.8).toFixed(1),
            subscribedLabel: count >= 1000 ? Math.floor(count / 1000) + ',' + String(count % 1000).padStart(3, '0') + '+' : count + '+',
            version: res.version || 'V2.4'
          }
        }
      } catch (e) {
        // 静默失败，保留默认值
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-background);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.preview-section {
  flex: 1;
  min-height: 400rpx;
  background-color: var(--color-surface-container-high);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}
.dot-bg {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image: radial-gradient(circle at 2px 2px, var(--color-outline) 1px, transparent 0);
  background-size: 24px 24px;
}
.flow-card {
  width: 100%;
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-outline-variant);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}
.flow-cover {
  width: 100%;
  height: 360rpx;
}
.flow-placeholder {
  border: 2px dashed var(--color-outline-variant);
  border-radius: var(--radius-md);
  padding: 40rpx;
  margin: var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  background-color: rgba(249,249,255,0.5);
}
.flow-icon { font-size: 64rpx; }
.flow-title { font-size: var(--font-h2); font-weight: 600; color: var(--color-outline); }
.flow-subtitle { font-size: var(--font-caption); color: var(--color-secondary); }
.preview-tags {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  z-index: 10;
}
.price-badge {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
  padding: 8rpx 24rpx;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, rgba(161,59,0,0.12), rgba(200,80,20,0.08));
  border: 1px solid rgba(161,59,0,0.15);
}
.price-symbol {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--color-tertiary);
}
.price-amount {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--color-tertiary);
  letter-spacing: -0.02em;
}
.detail-section {
  background-color: var(--color-surface-container-lowest);
  padding: var(--space-md);
  border-radius: 48rpx 48rpx 0 0;
  margin-top: -32rpx;
  box-shadow: 0 -8px 24px rgba(0,0,0,0.03);
  z-index: 20;
}
.detail-h1 {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 8rpx;
  display: block;
}
.detail-desc {
  font-size: var(--font-body-md);
  color: var(--color-secondary);
  margin-bottom: var(--space-lg);
  display: block;
  line-height: 1.6;
}

/* 锁定状态 */
.locked-section { margin-bottom: var(--space-lg); }

/* 内容预览区域（统一容器） */
.content-preview-area { margin-bottom: var(--space-lg); }
.preview-wrap {
  position: relative;
  overflow: hidden;
  max-height: 600rpx;
  border-radius: var(--radius-md);
}
.preview-content {
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
  line-height: 1.8;
}
.preview-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 280rpx;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.3) 20%,
    rgba(255,255,255,0.7) 50%,
    rgba(255,255,255,0.92) 75%,
    rgba(255,255,255,1) 100%
  );
  pointer-events: none;
}
.locked-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 24rpx;
  background: linear-gradient(135deg, rgba(0,83,205,0.04), rgba(0,83,205,0.08));
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-outline-variant);
}
.locked-icon { font-size: 56rpx; margin-bottom: 16rpx; }
.locked-title {
  font-size: var(--font-h2);
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 8rpx;
}
.locked-desc {
  font-size: var(--font-caption);
  color: var(--color-secondary);
  text-align: center;
}
.locked-price-tag {
  margin-top: 20rpx;
  padding: 8rpx 32rpx;
  background-color: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-full);
  font-size: var(--font-h2);
  font-weight: 700;
}

/* 文件区域 */
.file-section { margin-bottom: 0; }
.file-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: var(--color-primary-container);
  border-radius: var(--radius-lg);
  gap: 16rpx;
}
.file-icon-wrap {
  width: 80rpx; height: 80rpx;
  border-radius: 16rpx;
  background: rgba(0,83,205,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.file-icon { font-size: 36rpx; }
.file-info { flex: 1; }
.file-name {
  font-size: var(--font-body-md);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
  margin-bottom: 4rpx;
}
.file-hint {
  font-size: var(--font-caption);
  color: var(--color-secondary);
}
.file-arrow {
  font-size: 28rpx;
  color: var(--color-primary);
  font-weight: 700;
}

/* 富文本 */
.rich-content {
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
  line-height: 1.8;
  margin-bottom: var(--space-md);
}

/* 空状态 */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}
.empty-icon { font-size: 64rpx; margin-bottom: 16rpx; }
.empty-text { font-size: var(--font-body-md); color: var(--color-secondary); }

/* 按钮 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-md);
}
.btn-primary-full {
  height: 100rpx;
  background-color: var(--color-primary-container);
  color: var(--color-on-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-h2);
  font-weight: 600;
  box-shadow: var(--shadow-md);
}
.btn-primary-full:active { transform: scale(0.98); }
.btn-outline-full {
  height: 100rpx;
  border: 1px solid var(--color-outline);
  color: var(--color-on-surface);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-h2);
  font-weight: 600;
}
.btn-outline-full:active { background-color: var(--color-surface-variant); }
.trust-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-outline-variant);
  margin-top: var(--space-md);
}
.trust-item {
  flex: 1;
  text-align: center;
  border-right: 1px solid var(--color-outline-variant);
  padding: 0 8rpx;
}
.trust-last { border-right: none; }
.trust-value {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
}
.primary-text { color: var(--color-primary); }
.trust-label {
  font-size: var(--font-caption);
  color: var(--color-secondary);
}
</style>
