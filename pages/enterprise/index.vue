<template>
  <view class="page-container">
    <!-- 头图 -->
    <view class="hero-section">
      <image class="hero-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoT0C-bpVSldf0ojf0EXkoxgsBkK8DSNBEz1Oe0zNJQ8hhbTXT8FnXH4BsJtjAd-YCIxPjj3DIfrXG5DuONnl2KDtN8bdSsuZZOfytAp5MKrm4WOB8jIxrddj5hiv1VFUpMCbM6twRMJMYzn-dRrnvkxuUaJQwCT77ixUquUuTQ9x4a1HdH_vdkTGX7z5D_FnaJhflPFxjSJGW60NnN3YFkOZK0irzhHnZZnIOMluqVMDiF15CyH1pfL0T6gLxMx4fxNNNSHf_QXad" mode="aspectFill" />
      <view class="hero-overlay"></view>
    </view>
    <text class="page-h1">服务目录</text>
    <text class="page-subtitle">为您提供全方位的人力资源管理解决方案，助力企业高效运营。</text>

    <!-- 服务卡片列表 -->
    <view class="service-list">
      <view class="service-item" v-for="(item, i) in services" :key="i" @tap="goDetail(item)">
        <view class="service-item-left">
          <view class="service-icon-wrap">
            <text class="service-icon">{{ item.icon }}</text>
          </view>
          <view class="service-text">
            <text class="service-name">{{ item.name }}</text>
            <text class="service-desc">{{ item.desc }}</text>
          </view>
        </view>
        <text class="chevron">›</text>
      </view>
    </view>

    <!-- 帮助提示 -->
    <view class="help-section" @tap="goContact">
      <text class="help-icon">🎧</text>
      <view class="help-text">
        <text class="help-title">需要人力资源咨询？</text>
        <text class="help-desc">联系企业HR专员协助处理</text>
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
export default {
  data() {
    return {
      services: [
        { icon: '🔍', name: '招聘管理', desc: '人才筛选与入职流程', path: '/pages/flow-detail/index' },
        { icon: '🎓', name: '培训管理', desc: '员工技能提升与内培', path: '' },
        { icon: '📊', name: '绩效管理', desc: 'KPI考核与绩效评估', path: '' },
        { icon: '💰', name: '薪酬福利管理', desc: '薪资核算与社会福利', path: '' },
        { icon: '👥', name: '员工关系管理', desc: '合同签署与员工激励', path: '' },
        { icon: '📋', name: '职位管理', desc: '组织架构与职务设定', path: '' }
      ]
    }
  },
  methods: {
    goDetail(item) {
      if (item.path) uni.navigateTo({ url: item.path })
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
  gap: var(--space-sm);
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
.service-item-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.service-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--radius-md);
  background-color: rgba(20,107,251,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
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
}
.help-section {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background-color: var(--color-surface-container);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.help-icon { font-size: 36rpx; }
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
