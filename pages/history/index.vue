<template>
  <view class="page">
    <!-- 顶部导航 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">浏览历史</text>
      <view class="nav-right" v-if="historyList.length > 0" @tap="handleClear">
        <text class="nav-clear">清空</text>
      </view>
    </view> -->

    <!-- 主内容 -->
    <view class="main">
      <!-- 历史列表 -->
      <view class="history-list">
        <view class="history-card" v-for="(item, idx) in historyList" :key="idx" @tap="viewDetail(item)">
          <view class="history-cover-wrap">
            <image v-if="item.coverImage" class="history-cover" :src="item.coverImage" mode="aspectFill" />
            <view v-else class="history-cover-placeholder">
              <text class="history-cover-icon">{{ item.serviceType === 'survey' ? '📝' : '📋' }}</text>
            </view>
          </view>
          <view class="history-info">
            <text class="history-title">{{ item.title || '未命名内容' }}</text>
            <text class="history-meta">{{ item.categoryName || '服务' }} · {{ formatTime(item.createdAt) }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-bar">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-if="!loading && noMore && historyList.length > 0" class="loading-bar">
        <text class="loading-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && historyList.length === 0" class="empty-state">
        <text class="empty-icon">🕐</text>
        <text class="empty-text">暂无浏览记录</text>
        <text class="empty-sub">去首页浏览感兴趣的服务内容吧</text>
        <view class="empty-btn" @tap="goHome">
          <text class="empty-btn-text">去首页看看</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getBrowseHistory, clearBrowseHistory } from '@/api/index.js'

export default {
  data() {
    return {
      historyList: [],
      page: 1,
      pageSize: 20,
      loading: false,
      noMore: false
    }
  },
  onLoad() {
    this.fetchList()
  },
  onReachBottom() {
    if (!this.noMore && !this.loading) {
      this.page++
      this.fetchList()
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    goHome() { uni.reLaunch({ url: '/pages/index/index' }) },

    async fetchList() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await getBrowseHistory(this.page, this.pageSize)
        const list = res.list || res.records || []
        if (list.length < this.pageSize) {
          this.noMore = true
        }
        if (this.page === 1) {
          this.historyList = list
        } else {
          this.historyList = this.historyList.concat(list)
        }
      } catch (e) {
        console.error('获取浏览历史失败:', e)
      } finally {
        this.loading = false
      }
    },

    async handleClear() {
      uni.showModal({
        title: '提示',
        content: '确定清空所有浏览记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await clearBrowseHistory()
              this.historyList = []
              this.page = 1
              this.noMore = false
              uni.showToast({ title: '已清空', icon: 'success' })
            } catch (e) {
              uni.showToast({ title: '清空失败', icon: 'none' })
            }
          }
        }
      })
    },

    viewDetail(item) {
      if (item.serviceType === 'survey') {
        uni.navigateTo({ url: '/pages/survey/index?contentId=' + item.contentId })
      } else {
        uni.navigateTo({ url: '/pages/flow-detail/index?contentId=' + item.contentId })
      }
    },

    formatTime(t) {
      if (!t) return ''
      const d = new Date(t)
      const m = d.getMonth() + 1
      const day = d.getDate()
      return m + '月' + day + '日'
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-background); }
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: var(--color-surface-container-lowest);
  border-bottom: 1px solid var(--color-outline-variant);
}
.nav-icon { font-size: 20px; color: var(--color-primary); }
.nav-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); }
.nav-right { padding: 4px 8px; }
.nav-clear { font-size: 14px; color: var(--color-error); }
.main { padding: 20px 16px 32px; }

.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-card {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 12px; padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.history-card:active { background: #f8f8f8; }
.history-cover-wrap {
  width: 72px; height: 72px; border-radius: 8px; overflow: hidden; flex-shrink: 0;
}
.history-cover { width: 100%; height: 100%; object-fit: cover; }
.history-cover-placeholder {
  width: 100%; height: 100%; background: linear-gradient(135deg, #e8f0fe, #c2d9ff);
  display: flex; align-items: center; justify-content: center;
}
.history-cover-icon { font-size: 28px; }
.history-info { flex: 1; overflow: hidden; }
.history-title {
  font-size: 15px; font-weight: 500; color: var(--color-on-surface);
  display: block; margin-bottom: 6px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.history-meta { font-size: 12px; color: var(--color-on-surface-variant); }

.loading-bar { text-align: center; padding: 16px 0; }
.loading-text { font-size: 13px; color: var(--color-secondary); }

.empty-state { display: flex; flex-direction: column; align-items: center; padding-top: 100px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: var(--color-on-surface-variant); margin-bottom: 4px; }
.empty-sub { font-size: 12px; color: var(--color-outline); margin-bottom: 20px; }
.empty-btn {
  padding: 8px 28px; background: var(--color-primary); border-radius: 20px;
}
.empty-btn-text { font-size: 14px; color: #fff; font-weight: 500; }
</style>
