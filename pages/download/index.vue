<template>
  <view class="page-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          type="text"
          placeholder="搜索文档模板名称..."
          v-model="keyword"
          @input="onSearch"
          confirm-type="search"
        />
      </view>
    </view>

    <!-- 热门模板 -->
    <view v-if="hotTemplates.length > 0 && !keyword" class="section">
      <view class="section-header">
        <text class="section-title">热门模板</text>
      </view>
      <view class="hot-grid">
        <view
          v-for="item in hotTemplates"
          :key="'hot-' + item.id"
          class="hot-card"
          @tap="handleDownload(item)"
        >
          <view class="hot-icon-wrap" :style="{ backgroundColor: item.iconBg || 'rgba(0,83,205,0.1)' }">
            <text class="hot-icon">{{ item.icon || '📄' }}</text>
          </view>
          <view class="hot-info">
            <text class="hot-name">{{ item.name }}</text>
            <text class="hot-meta">{{ item.category }} • {{ getFileExtLabel(item.fileType) }}</text>
          </view>
          <view v-if="item.price > 0" class="hot-price-badge">
            <text class="hot-price-text">¥{{ item.price }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 按分类分组显示 -->
    <view v-for="group in groupedTemplates" :key="group.name" class="section">
      <view class="section-header">
        <view class="section-indicator"></view>
        <text class="section-title">{{ group.name }}</text>
      </view>

      <view class="template-list">
        <view
          v-for="item in group.items"
          :key="'tpl-' + item.id"
          class="template-card"
          @tap="handleDownload(item)"
        >
          <view class="template-left">
            <view class="template-icon-wrap">
              <text class="template-icon">{{ item.icon || '📄' }}</text>
            </view>
            <view class="template-info">
              <text class="template-name">{{ item.name }}</text>
              <text class="template-meta">{{ item.description || getFileExtLabel(item.fileType) }}</text>
            </view>
          </view>

          <view class="template-right">
            <view v-if="item.price > 0 && !item.unlocked" class="lock-badge">
              <text class="lock-text">🔒 ¥{{ item.price }}</text>
            </view>
            <view v-else class="download-btn">
              <text class="download-btn-text">下载</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!loading && allTemplates.length === 0" class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无模板数据</text>
    </view>

    <!-- 搜索无结果 -->
    <view v-if="keyword && filteredTemplates.length === 0 && !loading" class="empty-state">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">未找到匹配的模板</text>
    </view>
  </view>
</template>

<script>
import { getTemplates, downloadTemplate, createOrder, invokePayment } from '@/api/index.js'

const BASE_URL = 'http://localhost:8080'

export default {
  data() {
    return {
      keyword: '',
      allTemplates: [],
      loading: true
    }
  },
  computed: {
    /** 搜索过滤后的模板 */
    filteredTemplates() {
      if (!this.keyword) return this.allTemplates
      const kw = this.keyword.toLowerCase()
      return this.allTemplates.filter(t =>
        t.name.toLowerCase().includes(kw) ||
        (t.description && t.description.toLowerCase().includes(kw))
      )
    },
    /** 热门模板（取前2个） */
    hotTemplates() {
      return this.filteredTemplates.filter(t => t.isHot).slice(0, 2)
    },
    /** 按分类分组 */
    groupedTemplates() {
      const map = {}
      const order = []
      this.filteredTemplates.forEach(t => {
        const cat = t.category || '其他'
        if (!map[cat]) {
          map[cat] = []
          order.push(cat)
        }
        map[cat].push(t)
      })
      return order.map(name => ({ name, items: map[name] }))
    }
  },
  onLoad() {
    this.loadTemplates()
  },
  methods: {
    async loadTemplates() {
      try {
        const res = await getTemplates()
        // 确保数据格式正确
        this.allTemplates = (res || []).map(t => ({
          ...t,
          price: Number(t.price) || 0,
          unlocked: !!t.unlocked,
          isHot: !!t.isHot
        }))
      } catch (e) {
        console.error('加载模板失败:', e)
      } finally {
        this.loading = false
      }
    },

    onSearch() {
      // 搜索通过 computed 自动过滤
    },

    getFileExtLabel(fileType) {
      const map = { 1: 'Word', 2: 'PDF', 3: 'Excel', 4: 'PPT' }
      return map[fileType] || '文档'
    },

    /** 处理下载/购买 */
    async handleDownload(item) {
      // 付费且未解锁 → 引导购买
      if (item.price > 0 && !item.unlocked) {
        const token = uni.getStorageSync('token')
        if (!token) {
          uni.showToast({ title: '请先登录', icon: 'none' })
          setTimeout(() => {
            const cur = getCurrentPages().pop()
            uni.navigateTo({ url: '/pages/login/index?redirect=' + encodeURIComponent('/' + cur.route) })
          }, 1500)
          return
        }

        uni.showModal({
          title: '付费模板',
          content: `该模板需付费 ¥${item.price}，是否立即购买？`,
          confirmText: '立即购买',
          success: async (res) => {
            if (res.confirm) {
              await this.purchaseTemplate(item)
            }
          }
        })
        return
      }

      // 免费或已解锁 → 直接下载
      this.doDownload(item)
    },

    /** 执行文件下载 */
    doDownload(item) {
      const token = uni.getStorageSync('token')
      const header = {}
      if (token) {
        header['Authorization'] = 'Bearer ' + token
      }

      uni.showLoading({ title: '下载中...' })
      uni.downloadFile({
        url: BASE_URL + '/api/v1/app/templates/' + item.id + '/download',
        header,
        success: (res) => {
          uni.hideLoading()
          if (res.statusCode === 200) {
            uni.openDocument({
              filePath: res.tempFilePath,
              showMenu: true,
              fail: () => uni.showToast({ title: '无法打开文件', icon: 'none' })
            })
          } else if (res.statusCode === 403) {
            uni.showToast({ title: '请先购买后再下载', icon: 'none' })
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

    /** 购买模板 */
    async purchaseTemplate(item) {
      try {
        uni.showLoading({ title: '创建订单...' })
        const orderRes = await createOrder({
          orderType: 1,
          title: '购买模板: ' + item.name,
          amount: item.price,
          items: [{
            itemType: 5, // 5=模板购买
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
          }]
        })

        uni.showLoading({ title: '支付中...' })
        await invokePayment(orderRes.orderId)

        uni.hideLoading()
        uni.showToast({ title: '购买成功', icon: 'success' })

        // 重新加载
        await this.loadTemplates()
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '支付失败: ' + (e.message || ''), icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-background);
  min-height: 100vh;
  padding-bottom: 32rpx;
}

/* 搜索栏 */
.search-section {
  position: sticky;
  top: 0;
  z-index: 40;
  background-color: var(--color-background);
  padding: var(--space-md) var(--margin-page) var(--space-sm);
}
.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--color-surface-container-low);
  border-radius: var(--radius-lg);
  padding: 0 var(--space-md);
  height: 88rpx;
}
.search-icon {
  font-size: 28rpx;
  margin-right: var(--space-sm);
}
.search-input {
  flex: 1;
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
  background: transparent;
  border: none;
}

/* 通用section */
.section {
  padding: 0 var(--margin-page);
  margin-top: var(--space-lg);
}
.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.section-indicator {
  width: 6rpx;
  height: 36rpx;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
}
.section-title {
  font-size: var(--font-h3);
  font-weight: 600;
  color: var(--color-on-surface);
}

/* 热门模板双列网格 */
.hot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gutter-grid);
}
.hot-card {
  background-color: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  min-height: 200rpx;
  position: relative;
  transition: transform 0.15s;
}
.hot-card:active {
  transform: scale(0.96);
}
.hot-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-sm);
}
.hot-icon {
  font-size: 36rpx;
}
.hot-info {
  flex: 1;
}
.hot-name {
  font-size: var(--font-label-sm);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
  margin-bottom: 4rpx;
}
.hot-meta {
  font-size: var(--font-caption);
  color: var(--color-outline);
}
.hot-price-badge {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  background-color: rgba(161, 59, 0, 0.1);
  border-radius: var(--radius-full);
  padding: 2rpx 12rpx;
}
.hot-price-text {
  font-size: var(--font-caption);
  color: var(--color-tertiary);
  font-weight: 600;
}

/* 模板列表 */
.template-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.template-card {
  background-color: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.15s;
}
.template-card:active {
  background-color: var(--color-surface-container);
}
.template-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
  min-width: 0;
}
.template-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  background-color: var(--color-surface-container-low);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.template-icon {
  font-size: 40rpx;
}
.template-info {
  flex: 1;
  min-width: 0;
}
.template-name {
  font-size: var(--font-body-md);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
  margin-bottom: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.template-meta {
  font-size: var(--font-caption);
  color: var(--color-outline);
}
.template-right {
  flex-shrink: 0;
  margin-left: var(--space-sm);
}

/* 下载按钮 */
.download-btn {
  background-color: rgba(30, 111, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: var(--space-sm) var(--space-md);
}
.download-btn-text {
  font-size: var(--font-label-sm);
  font-weight: 600;
  color: var(--color-primary);
}
.download-btn:active {
  opacity: 0.7;
}

/* 锁定标记 */
.lock-badge {
  background-color: rgba(161, 59, 0, 0.08);
  border-radius: var(--radius-lg);
  padding: var(--space-sm) var(--space-md);
}
.lock-text {
  font-size: var(--font-label-sm);
  font-weight: 600;
  color: var(--color-tertiary);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
.empty-icon {
  font-size: 64rpx;
  margin-bottom: var(--space-md);
}
.empty-text {
  font-size: var(--font-body-md);
  color: var(--color-secondary);
}
</style>
