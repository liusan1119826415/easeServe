<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <!-- <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">{{ pageTitle }}</text>
    </view> -->

    <!-- 头图区域 -->
    <view class="hero-section">
      <image
        class="hero-img"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoT0C-bpVSldf0ojf0EXkoxgsBkK8DSNBEz1Oe0zNJQ8hhbTXT8FnXH4BsJtjAd-YCIxPjj3DIfrXG5DuONnl2KDtN8bdSsuZZOfytAp5MKrm4WOB8jIxrddj5hiv1VFUpMCbM6twRMJMYzn-dRrnvkxuUaJQwCT77ixUquUuTQ9x4a1HdH_vdkTGX7z5D_FnaJhflPFxjSJGW60NnN3YFkOZK0irzhHnZZnIOMluqVMDiF15CyH1pfL0T6gLxMx4fxNNNSHf_QXad"
        mode="aspectFill"
      />
      <view class="hero-overlay"></view>
    </view>

    <text class="page-subtitle">为您提供全方位的人力资源管理解决方案，助力企业高效运营。</text>

    <!-- 服务分组列表 -->
    <view class="service-list" v-if="groups.length > 0">
      <view
        class="group-section"
        v-for="(group, gi) in groups"
        :key="gi"
        :style="{ backgroundColor: groupColors[gi % groupColors.length] }"
      >
        <view class="group-header">
          <text class="group-title">{{ group.name }}</text>
        </view>
        <view class="group-items">
          <view
            class="group-item"
            v-for="(item, ii) in (group.children || [])"
            :key="ii"
            @tap="goSubCategory(item)"
          >
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-desc">包含{{ (item.children && item.children.length) || 0 }}项子流程</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="loaded && groups.length === 0" class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无服务分类</text>
    </view>

    <!-- 帮助提示 -->
    <view class="help-section" @tap="goContact">
      <text class="help-icon">🎧</text>
      <view class="help-text-wrap">
        <text class="help-title">需要人力资源咨询？</text>
        <text class="help-desc">联系企业HR专员协助处理</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCategories } from '@/api/index.js'

export default {
  data() {
    return {
      groups: [],
      pageTitle: '人力资源',
      loaded: false,
      groupColors: ['#EBF4FF', '#F0F7FF', '#F5FAFF', '#EBF4FF', '#F0F7FF']
    }
  },
  onLoad(options) {
    const categoryName = options.name || '人力资源'
    this.pageTitle = categoryName
    uni.setNavigationBarTitle({ title: categoryName })
    this.loadServices(categoryName)
  },
  methods: {
    async loadServices(categoryName) {
      try {
        const categories = await getCategories()
        if (!categories || categories.length === 0) {
          this.loaded = true
          return
        }

        // 查找匹配的父分类
        const parent = categories.find(c => c.name === categoryName)
        if (!parent) {
          // 没找到匹配，显示所有一级分类
          this.groups = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            emoji: cat.emoji || '',
            iconBg: cat.iconBg || '',
            description: cat.description || '',
            children: cat.children || []
          }))
        } else {
          // 显示匹配分类的子级作为分组
          this.groups = (parent.children || []).map(cat => ({
            id: cat.id,
            name: cat.name,
            emoji: cat.emoji || '',
            iconBg: cat.iconBg || '',
            description: cat.description || '',
            children: cat.children || []
          }))
        }
      } catch (e) {
        console.error('加载服务分类失败:', e)
      } finally {
        this.loaded = true
      }
    },

    goSubCategory(item) {
      // 跳转到子分类页面（23.html风格），展示该分类下的3级菜单
      uni.navigateTo({
        url: '/pages/service-detail/index?categoryId=' + item.id + '&categoryName=' + encodeURIComponent(item.name)
      })
    },

    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    },

    goContact() {
      uni.navigateTo({ url: '/pages/contact/index' })
    },
  }
}
</script>

<style scoped>
.page-container {
  background-color: #faf9f9;
  min-height: 100vh;
  padding-bottom: 32rpx;
}

/* 顶部导航 */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 0 32rpx;
  background-color: #faf9f9;
  border-bottom: 1px solid #e3e2e2;
}
.back-btn {
  padding: 8rpx 12rpx;
  margin-left: -8rpx;
}
.back-icon {
  font-size: 40rpx;
  color: #1E6FFF;
  font-weight: 700;
}
.header-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1E6FFF;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* 头图 */
.hero-section {
  position: relative;
  height: 320rpx;
  margin: 24rpx 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
}
.hero-img {
  width: 100%;
  height: 100%;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(30, 111, 255, 0.2), transparent);
}

/* 副标题 */
.page-subtitle {
  display: block;
  font-size: 26rpx;
  color: #424655;
  padding: 0 32rpx;
  margin-bottom: 32rpx;
  line-height: 1.6;
}

/* 服务分组 */
.service-list {
  padding: 0 32rpx;
}
.group-section {
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}
.group-header {
  margin-bottom: 24rpx;
}
.group-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1E6FFF;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.group-items {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 32rpx;
  border-radius: 20rpx;
  transition: all 0.2s;
}
.group-item:active {
  background-color: #f5f5f5;
  transform: scale(0.98);
}
.item-info {
  display: flex;
  flex-direction: column;
}
.item-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1b1c1c;
}
.item-desc {
  font-size: 22rpx;
  color: #727787;
  margin-top: 6rpx;
}
.item-arrow {
  font-size: 36rpx;
  color: #c2c6d8;
  font-weight: 300;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}
.empty-text {
  font-size: 28rpx;
  color: #909399;
}

/* 帮助提示 */
.help-section {
  margin: 48rpx 32rpx;
  padding: 32rpx;
  background-color: #f4f3f3;
  border: 1px solid #e3e2e2;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
}
.help-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}
.help-text-wrap {
  display: flex;
  flex-direction: column;
}
.help-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1b1c1c;
}
.help-desc {
  font-size: 22rpx;
  color: #424655;
  margin-top: 4rpx;
}
</style>
