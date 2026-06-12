<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">我的收藏</text>
      <view class="nav-right"></view>
    </view>

    <!-- 主内容 -->
    <view class="main">
      <!-- 筛选标签 -->
      <scroll-view class="filter-tabs" scroll-x>
        <view class="filter-item" v-for="(tab, idx) in tabs" :key="idx" :class="{ active: activeFilter === idx }" @tap="activeFilter = idx">
          <text class="filter-text" :class="{ 'filter-text-active': activeFilter === idx }">{{ tab }}</text>
        </view>
      </scroll-view>

      <!-- 收藏网格 -->
      <view class="fav-grid">
        <view class="fav-card" v-for="(item, idx) in favorites" :key="idx" @tap="viewDetail(item)">
          <view class="fav-img-wrap">
            <view class="fav-img-bg">
              <text class="fav-img-icon">{{ item.icon }}</text>
            </view>
            <view class="fav-heart" @tap.stop="toggleFav(idx)">
              <text class="heart-icon" :class="{ active: item.liked }">❤</text>
            </view>
          </view>
          <view class="fav-info">
            <text class="fav-name">{{ item.name }}</text>
            <text class="fav-meta">{{ item.meta }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="favorites.length === 0" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无收藏内容</text>
        <text class="empty-sub">您可以去首页浏览并收藏您感兴趣的服务</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeFilter: 0,
      tabs: ['全部', '流程图', '政策指南', '企业培训'],
      favorites: [
        { name: '招聘流程图', meta: '人力体系 • 2024.03.12', icon: '📋', liked: true },
        { name: '社保政策指南', meta: '财务/法律 • 2024.02.28', icon: '📖', liked: true },
        { name: '员工手册 V2.0', meta: '综合管理 • 2024.01.15', icon: '📑', liked: true },
        { name: '领导力培训课件', meta: '个人成长 • 2024.04.01', icon: '🎓', liked: true }
      ]
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    toggleFav(idx) {
      this.favorites[idx].liked = !this.favorites[idx].liked
      if (!this.favorites[idx].liked) {
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      }
    },
    viewDetail(item) {
      uni.navigateTo({ url: '/pages/flow-detail/index' })
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
.main { padding: 30px 16px 32px; }

.filter-tabs { white-space: nowrap; margin-bottom: 16px; }
.filter-item {
  display: inline-block; padding: 6px 16px; border-radius: 20px;
  background: var(--color-surface-container-high); margin-right: 8px;
}
.filter-item:last-child { margin-right: 0; }
.filter-item.active { background: var(--color-primary); }
.filter-text { font-size: 12px; font-weight: 500; color: var(--color-on-surface-variant); }
.filter-text-active { color: #fff; }

.fav-grid { display: flex; flex-wrap: wrap; justify-content: space-between; }
.fav-card {
  width: 48%; background: #fff; border-radius: 12px;
  overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 12px; box-sizing: border-box;
}
.fav-img-wrap { position: relative; height: 128px; overflow: hidden; }
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
.fav-name { font-size: 14px; color: var(--color-on-surface); font-weight: 500; display: block; margin-bottom: 4px; }
.fav-meta { font-size: 11px; color: var(--color-on-surface-variant); }

.empty-state { display: flex; flex-direction: column; align-items: center; padding-top: 80px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: var(--color-on-surface-variant); }
.empty-sub { font-size: 11px; color: var(--color-outline); margin-top: 4px; }
</style>
