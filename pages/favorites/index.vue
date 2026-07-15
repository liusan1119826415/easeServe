<template>
  <view class="page">
    <!-- 顶部导航 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">我的收藏</text>
      <view class="nav-right"></view>
    </view> -->

    <!-- 主内容 -->
    <view class="main">
      <!-- 收藏网格 -->
      <view class="fav-grid">
        <view class="fav-card" v-for="(item, idx) in favorites" :key="item.id || idx" @tap="viewDetail(item)">
          <view class="fav-img-wrap">
            <image v-if="item.coverImage" class="fav-img-real" :src="fixImageUrl(item.coverImage)" mode="aspectFill" />
            <view v-else class="fav-img-bg">
              <text class="fav-img-icon">{{ item.serviceType === 'survey' ? '📝' : '📋' }}</text>
            </view>
            <view class="fav-heart" @tap.stop="toggleFav(idx, item)">
              <text class="heart-icon active">❤</text>
            </view>
          </view>
          <view class="fav-info">
            <text class="fav-name">{{ item.title || '未命名内容' }}</text>
            <text class="fav-meta">{{ item.categoryName || '服务' }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-bar">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-if="!loading && noMore && favorites.length > 0" class="loading-bar">
        <text class="loading-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && favorites.length === 0" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无收藏内容</text>
        <text class="empty-sub">您可以去首页浏览并收藏您感兴趣的服务</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getFavorites, removeFavorite } from '@/api/index.js'

export default {
  data() {
    return {
      favorites: [],
      page: 1,
      pageSize: 20,
      loading: false,
      noMore: false
    }
  },
  onLoad() {
    // 未登录跳转登录页
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.redirectTo({
        url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/favorites/index'),
        fail: () => uni.reLaunch({ url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/favorites/index') })
      })
      return
    }
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

    /** 处理图片URL：相对路径拼接BASE_URL */
    fixImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return 'http://localhost:8070' + url
    },

    async fetchList() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await getFavorites(this.page, this.pageSize)
        const list = res.list || res.records || []
        if (list.length < this.pageSize) {
          this.noMore = true
        }
        if (this.page === 1) {
          this.favorites = list
        } else {
          this.favorites = this.favorites.concat(list)
        }
      } catch (e) {
        console.error('获取收藏列表失败:', e)
      } finally {
        this.loading = false
      }
    },

    async toggleFav(idx, item) {
      uni.showModal({
        title: '提示',
        content: '确定取消收藏吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await removeFavorite(item.id)
              this.favorites.splice(idx, 1)
              uni.showToast({ title: '已取消收藏', icon: 'none' })
            } catch (e) {
              uni.showToast({ title: '取消失败', icon: 'none' })
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
.nav-right { width: 24px; }
.main { padding: 72px 16px 32px; }

.fav-grid { display: flex; flex-wrap: wrap; justify-content: space-between; }
.fav-card {
  width: 48%; background: #fff; border-radius: 12px;
  overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 12px; box-sizing: border-box;
}
.fav-img-wrap { position: relative; height: 128px; overflow: hidden; }
.fav-img-real { width: 100%; height: 100%; object-fit: cover; }
.fav-img-bg { width: 100%; height: 100%; background: linear-gradient(135deg, #e8f0fe, #c2d9ff); display: flex; align-items: center; justify-content: center; }
.fav-img-icon { font-size: 40px; }
.fav-heart {
  position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.9);
  width: 28px; height: 28px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}
.heart-icon { font-size: 14px; color: #ccc; }
.heart-icon.active { color: #ba1a1a; }
.fav-info { padding: 8px; }
.fav-name { font-size: 14px; color: var(--color-on-surface); font-weight: 500; display: block; margin-bottom: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav-meta { font-size: 11px; color: var(--color-on-surface-variant); }

.loading-bar { text-align: center; padding: 16px 0; }
.loading-text { font-size: 13px; color: var(--color-secondary); }

.empty-state { display: flex; flex-direction: column; align-items: center; padding-top: 80px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: var(--color-on-surface-variant); }
.empty-sub { font-size: 11px; color: var(--color-outline); margin-top: 4px; }
</style>
