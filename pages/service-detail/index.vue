<template>
  <view class="page-container">
    <!-- 主内容区 -->
    <view class="main-content">
      <!-- 欢迎卡片 -->
      <view class="hero-card">
        <view class="hero-text">
          <text class="hero-title">数字化人才管理</text>
          <text class="hero-desc">提供全链路闭环招聘服务，从需求确认到员工入职，高效赋能企业组织成长。</text>
        </view>
        <view class="hero-icon-wrap">
          <text class="hero-icon">👥</text>
        </view>
      </view>

      <!-- 流程列表区域 -->
      <view class="section-label">
        <view class="label-bar"></view>
        <text class="label-text">流程申请与办理</text>
      </view>

      <!-- L3 子分类列表 -->
      <view class="process-list" v-if="items.length > 0">
        <view
          class="process-item"
          v-for="(item, idx) in items"
          :key="idx"
          @tap="goFlowDetail(item)"
        >
          <view class="item-left">
            <view class="item-icon-wrap">
              <text class="item-icon">{{ item.emoji || '📄' }}</text>
            </view>
            <view class="item-info">
              <text class="item-name">{{ item.title || item.name }}</text>
              <text v-if="item.hasContent && item.stepCount > 0" class="item-meta">{{ item.stepCount }} 个步骤</text>
              <text v-else-if="!item.hasContent" class="item-meta item-meta-empty">暂未配置内容</text>
            </view>
          </view>
          <view class="item-right">
            <text v-if="item.hasContent && item.price > 0" class="item-price">¥{{ item.price }}</text>
            <text v-else-if="item.hasContent" class="item-free">免费</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && items.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无流程项目</text>
        <text class="empty-desc">管理员可在后台为该分类添加子级流程</text>
      </view>

      <!-- 辅助信息网格 -->
      <view class="info-grid">
        <view class="info-card" @tap="goContact">
          <text class="info-card-icon">📊</text>
          <text class="info-card-title">效率统计</text>
          <text class="info-card-desc">查看本月招聘周期效率分析</text>
        </view>
        <view class="info-card" @tap="goQA">
          <text class="info-card-icon">❓</text>
          <text class="info-card-title">操作指引</text>
          <text class="info-card-desc">了解如何发起入职审批流程</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getCategoryChildrenContents, getCategoryDetail } from '@/api/index.js'

export default {
  data() {
    return {
      categoryId: 0,
      categoryName: '',
      items: [],
      loading: true
    }
  },
  onLoad(options) {
    this.categoryId = parseInt(options.categoryId) || 0
    // 优先使用 URL 传入的名称（兼容旧逻辑），否则从服务端获取
    if (options.categoryName) {
      this.categoryName = decodeURIComponent(options.categoryName)
      uni.setNavigationBarTitle({ title: this.categoryName })
    }
    this.loadCategoryName()
    this.loadItems()
  },
  methods: {
    /** 从服务端获取分类名称 */
    async loadCategoryName() {
      if (this.categoryName) return // 已有名称则跳过
      try {
        const detail = await getCategoryDetail(this.categoryId)
        if (detail && detail.name) {
          this.categoryName = detail.name
          uni.setNavigationBarTitle({ title: this.categoryName })
        }
      } catch (e) {
        console.error('获取分类名称失败:', e)
      }
    },
    async loadItems() {
      this.loading = true
      try {
        const children = await getCategoryChildrenContents(this.categoryId)
        if (children && children.length > 0) {
          this.items = children.map(child => ({
            id: child.id,
            categoryId: child.categoryId,
            name: child.name,
            emoji: child.emoji || '',
            iconBg: child.iconBg || '',
            description: child.description || '',
            title: child.title || '',
            serviceType: child.serviceType || '',
            stepCount: child.stepCount || 0,
            price: child.price || 0,
            hasContent: child.hasContent || false,
          }))
        }
      } catch (e) {
        console.error('加载子分类失败:', e)
      } finally {
        this.loading = false
      }
    },

    goFlowDetail(item) {
      if (item.serviceType === 'survey') {
        uni.navigateTo({
          url: '/pages/survey/index?contentId=' + item.id
        })
        return
      }
      uni.navigateTo({
        url: '/pages/flow-detail/index?contentId=' + item.id
      })
    },

    goContact() {
      uni.navigateTo({ url: '/pages/contact/index' })
    },

    goQA() {
      uni.navigateTo({ url: '/pages/qa/index' })
    },
  }
}
</script>

<style scoped>
.page-container {
  background-color: #faf9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 32rpx;
}

/* 主内容 */
.main-content {
  padding: 32rpx 32rpx 32rpx;
}

/* 欢迎卡片 */
.hero-card {
  position: relative;
  background-color: #146bfb;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  overflow: hidden;
  color: #ffffff;
}
.hero-text {
  position: relative;
  z-index: 10;
}
.hero-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}
.hero-desc {
  font-size: 26rpx;
  opacity: 0.9;
  line-height: 1.5;
}
.hero-icon-wrap {
  position: absolute;
  right: -20rpx;
  bottom: -20rpx;
  opacity: 0.1;
}
.hero-icon {
  font-size: 200rpx;
}

/* 区域标签 */
.section-label {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 0 4rpx;
}
.label-bar {
  width: 4rpx;
  height: 32rpx;
  background-color: #0053cd;
  border-radius: 2rpx;
}
.label-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #0053cd;
}

/* 流程列表 */
.process-list {
  background-color: #ffffff;
  border-radius: 24rpx;
  border: 1px solid #c2c6d8;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 40rpx;
}
.process-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  transition: background-color 0.2s;
}
.process-item:active {
  background-color: #f5f5f5;
}
.process-item + .process-item {
  border-top: 1px solid #e3e2e2;
}
.item-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
  min-width: 0;
}
.item-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background-color: #dfe2ea;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.item-icon {
  font-size: 36rpx;
}
.item-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}
.item-name {
  font-size: 30rpx;
  color: #1b1c1c;
  font-weight: 400;
}
.item-meta {
  font-size: 22rpx;
  color: #0053cd;
}
.item-meta-empty {
  color: #c0c4cc;
}
.item-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}
.item-price {
  font-size: 26rpx;
  font-weight: 600;
  color: #e31e24;
}
.item-free {
  font-size: 22rpx;
  color: #67c23a;
}
.item-arrow {
  font-size: 36rpx;
  color: #c2c6d8;
  font-weight: 300;
  transition: transform 0.2s;
}
.process-item:active .item-arrow {
  transform: translateX(4rpx);
}

/* 加载与空状态 */
.loading-state {
  text-align: center;
  padding: 60rpx 0;
}
.loading-text {
  font-size: 26rpx;
  color: #909399;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}
.empty-icon {
  font-size: 72rpx;
  margin-bottom: 20rpx;
}
.empty-text {
  font-size: 28rpx;
  color: #1b1c1c;
  font-weight: 500;
}
.empty-desc {
  font-size: 22rpx;
  color: #909399;
  margin-top: 8rpx;
}

/* 辅助网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}
.info-card {
  background-color: #f4f3f3;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  aspect-ratio: 1;
}
.info-card:active {
  background-color: #efeded;
}
.info-card-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}
.info-card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1b1c1c;
}
.info-card-desc {
  font-size: 22rpx;
  color: #727787;
  margin-top: 8rpx;
}
</style>
