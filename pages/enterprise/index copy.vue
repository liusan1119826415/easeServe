<template>
  <view class="page-container">
    <!-- 头图 -->
    <view class="hero-section">
      <image class="hero-img" src="/static/enterprise.png" mode="aspectFill" />
      <view class="hero-overlay"></view>
    </view>
    <text class="page-h1">服务目录</text>
    <text class="page-subtitle">为您提供全方位的人力资源管理解决方案，助力企业高效运营。</text>

    <!-- 服务卡片列表 -->
    <view class="service-list">
      <view class="service-group" v-for="(item, i) in services" :key="i">
        <!-- 主菜单 -->
        <view class="service-item" :class="{ 'item-expanded': expandedIndex === i }" @tap="toggleMenu(i)">
          <view class="service-item-left">
            <view class="service-icon-wrap">
              <text class="service-icon">{{ item.icon }}</text>
            </view>
            <view class="service-text">
              <text class="service-name">{{ item.name }}</text>
              <text class="service-desc">{{ item.desc }}</text>
            </view>
          </view>
          <text class="chevron" :class="{ 'chevron-open': expandedIndex === i }">›</text>
        </view>
        <!-- 子菜单（内容标题列表） -->
        <view class="sub-menu" v-if="expandedIndex === i && item.contents && item.contents.length">
          <view class="sub-item" v-for="(sub, j) in item.contents" :key="j" @tap="goContentDetail(sub)">
            <text class="sub-dot">·</text>
            <text class="sub-name">{{ sub.title }}</text>
            <text v-if="sub.price > 0" class="sub-price">¥{{ sub.price }}</text>
            <text v-else class="sub-free">免费</text>
            <text class="sub-arrow">›</text>
          </view>
        </view>
        <view class="sub-menu sub-empty" v-if="expandedIndex === i && (!item.contents || item.contents.length === 0) && item.contentsLoaded">
          <view class="sub-item-empty">
            <text class="sub-name" style="text-align:center;color:var(--color-outline);">暂无内容</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 帮助提示 -->
    <view class="help-section" @tap="goContact">
      <text class="help-icon">🎧</text>
      <view class="help-text">
        <text class="help-title">需要人力资源咨询？</text>
        <text class="help-desc ">联系企业HR专员协助处理</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav safe-area-bottom">
      <view class="nav-item" @tap="switchTab(0)">
        <text class="nav-icon">🏠</text><text class="nav-label">首页</text>
      </view>
      <view class="nav-item" @tap="switchTab(1)">
        <text class="nav-icon">💬</text><text class="nav-label">智能问答</text>
      </view>
      <view class="nav-item nav-active" @tap="switchTab(2)">
        <text class="nav-icon">💼</text><text class="nav-label">企业信息</text>
      </view>
      <view class="nav-item" @tap="switchTab(3)">
        <text class="nav-icon">👤</text><text class="nav-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCategories, getCategoryContents } from '@/api/index.js'

export default {
  data() {
    return {
      expandedIndex: -1,
      services: [],
      pageTitle: '服务目录'
    }
  },
  onLoad(options) {
    // 从 URL 参数获取要展示的分类名称
    const categoryName = options.name || '人力资源'
    this.pageTitle = categoryName
    uni.setNavigationBarTitle({ title: categoryName })
    this.loadServices(categoryName).then(() => {
      // 加载完成后自动展开第一个菜单
      if (this.services.length > 0) {
        this.toggleMenu(0)
      }
    })
  },
  methods: {
    async loadServices(categoryName) {
      try {
        const categories = await getCategories()
        if (!categories || categories.length === 0) return

        // 查找匹配的父分类
        const parent = categories.find(c => c.name === categoryName)
        if (!parent) {
          // 没找到匹配，显示所有一级分类
          this.services = categories.map(cat => ({
            id: cat.id,
            icon: cat.emoji || '',
            name: cat.name,
            desc: cat.description,
            contents: null,
            contentsLoaded: false
          }))
          return
        }

        // 找到匹配分类，显示其子分类
        this.services = (parent.children || []).map(cat => ({
          id: cat.id,
          icon: cat.emoji || '',
          name: cat.name,
          desc: cat.description,
          contents: null,
          contentsLoaded: false
        }))
      } catch (e) {
        console.error('加载服务分类失败:', e)
      }
    },
    async toggleMenu(index) {
      const item = this.services[index]
      if (this.expandedIndex === index) {
        this.expandedIndex = -1
        return
      }
      this.expandedIndex = index

      // 加载内容列表
      if (!item.contentsLoaded) {
        try {
          const res = await getCategoryContents(item.id)
          item.contents = (res && res.contents) || []
          item.contentsLoaded = true
        } catch (e) {
          item.contents = []
          item.contentsLoaded = true
        }
      }
    },
    goContentDetail(content) {
      uni.navigateTo({ url: '/pages/flow-detail/index?contentId=' + content.id })
    },
    goContact() {
      uni.navigateTo({ url: '/pages/contact/index' })
    },
    switchTab(index) {
      const tabs = ['/pages/index/index', '/pages/qa/index', '/pages/enterprise/index', '/pages/my/index']
      if (index === 2) return
      uni.navigateTo({ url: tabs[index] })
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-surface-container-lowest);
  min-height: 100vh;
  padding: var(--space-md);
  padding-bottom: 130rpx;
}
.hero-section {
  position: relative;
  height: 280rpx;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-md);
}
.hero-img { width: 100%; height: 100%; }
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,83,205,0.2), transparent);
}
.page-h1 {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 8rpx;
  display: block;
}
.page-subtitle {
  font-size: var(--font-body-md);
  color: var(--color-on-surface-variant);
  margin-bottom: var(--space-lg);
  display: block;
}
.service-list {
  display: flex;
  flex-direction: column;
}
.service-group {
  margin-bottom: 8px;
}
.service-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: 20rpx;
  padding: var(--space-md);
}
.service-item:active { transform: scale(0.98); }
.item-expanded {
  border-radius: 20rpx 20rpx 0 0;
  border-bottom-color: transparent;
}
.service-item-left {
  display: flex;
  align-items: center;
}
.service-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--radius-md);
  background-color: rgba(20,107,251,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}
.service-icon { font-size: 32rpx; }
.service-name {
  font-size: var(--font-h2);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
}
.service-desc {
  font-size: var(--font-caption);
  color: var(--color-on-surface-variant);
}
.chevron {
  font-size: 28rpx;
  color: var(--color-outline);
  transition: transform 0.25s;
}
.chevron-open {
  transform: rotate(90deg);
}
.sub-menu {
  background: var(--color-surface-container-low);
  border-radius: 0 0 20rpx 20rpx;
  padding: 4px 16px 12px;
  margin-top: -1px;
  border: 1px solid var(--color-outline-variant);
  border-top: none;
}
.sub-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid rgba(194,198,216,0.3);
}
.sub-item:last-child {
  border-bottom: none;
}
.sub-item-empty {
  padding: 24px 8px;
}
.sub-item:active {
  background: rgba(0,83,205,0.05);
  border-radius: 8px;
}
.sub-dot {
  font-size: 24px;
  color: var(--color-primary);
  margin-right: 12px;
  font-weight: 700;
}
.sub-name {
  flex: 1;
  font-size: 14px;
  color: var(--color-on-surface);
}
.sub-price {
  font-size: 12px;
  color: var(--color-tertiary);
  font-weight: 600;
  margin-right: 8px;
}
.sub-free {
  font-size: 12px;
  color: #67c23a;
  font-weight: 600;
  margin-right: 8px;
}
.sub-arrow {
  font-size: 18px;
  color: var(--color-outline);
}
.help-section {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background-color: var(--color-surface-container);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
}
.help-icon { font-size: 36rpx; margin-right: 16rpx; }
.help-title {
  font-size: var(--font-label-sm);
  font-weight: 500;
  color: var(--color-on-surface);
  display: block;
}
.help-desc {
  font-size: var(--font-caption);
  color: var(--color-on-surface-variant);
}
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: var(--color-surface-container-lowest);
  border-top: 1px solid var(--color-outline-variant);
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 110rpx;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.nav-icon { font-size: 44rpx; margin-bottom: 2rpx; }
.nav-label { font-size: var(--font-label-sm); color: var(--color-secondary); }
.nav-active .nav-label { color: var(--color-primary); font-weight: 600; }
</style>
