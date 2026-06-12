<template>
  <view class="page-container">
    <!-- Banner -->
    <view class="banner-section">
      <view class="banner-overlay">
        <text class="banner-title">企业一站式服务</text>
        <text class="banner-subtitle">专业、高效、可靠的数字化管理助手</text>
      </view>
      <image class="banner-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAYovAZpMyqLQLpfn-YxzSJtnZSUJQv7qhsCBdbHic2U4Lp7vAt5qr6BpUmj6iyq79nAug8dfNCqeimzPErsbgBTCp6zCsVf2jvlNuSoGQVxtoi4x0AmOD1pHPVaH8kSPfdPGQ4REZiuOSCqneh6yyH-Ab3xVsn2wIkfFwNgtwsZUeM2bjOpB-a5V2x3sn6tEsIyOI9jmESzeVEl31A7x_oFdQsmyJpMYRu2lH3FMYNfpqDmygzWrEJjDV8pyiM-3d3M-S_7byVXMX" mode="aspectFill" />
    </view>

    <!-- 服务网格 -->
    <view class="service-grid">
      <view class="service-card" v-for="(item, index) in services" :key="index" @tap="navigateTo(item.path)">
        <view class="service-icon" :style="{ backgroundColor: item.iconBg }">
          <text class="icon-text">{{ item.icon }}</text>
        </view>
        <text class="service-title">{{ item.title }}</text>
        <text class="service-desc">{{ item.desc }}</text>
      </view>
      <!-- 模板下载 - 横跨两列 -->
      <view class="service-card service-card-wide" @tap="navigateTo('/pages/download/index')">
        <view class="service-card-wide-inner">
          <view class="service-icon" style="background-color: var(--color-secondary-container);">
            <text class="icon-text">📥</text>
          </view>
          <view class="service-wide-text">
            <text class="service-title">模板下载</text>
            <text class="service-desc">合同/制度/公文范本</text>
          </view>
          <text class="chevron-icon">›</text>
        </view>
      </view>
    </view>

    <!-- 第三方服务 -->
    <view class="section-header">
      <view class="section-indicator"></view>
      <text class="section-title">第三方服务</text>
    </view>
    <view class="third-party-grid">
      <view class="third-party-item" v-for="(item, index) in thirdPartyServices" :key="index" @tap="openExternal(item.url)">
        <view class="third-party-icon" :style="{ backgroundColor: item.color }">
          <text class="third-party-emoji">{{ item.icon }}</text>
        </view>
        <text class="third-party-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav safe-area-bottom">
      <view class="nav-item nav-active" @tap="switchTab(0)">
        <text class="nav-icon">🏠</text>
        <text class="nav-label">首页</text>
      </view>
      <view class="nav-item" @tap="switchTab(1)">
        <text class="nav-icon">💬</text>
        <text class="nav-label">智能问答</text>
      </view>
      <view class="nav-item" @tap="switchTab(2)">
        <text class="nav-icon">💼</text>
        <text class="nav-label">企业信息</text>
      </view>
      <view class="nav-item" @tap="switchTab(3)">
        <text class="nav-icon">👤</text>
        <text class="nav-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      services: [
        { icon: '🛡️', title: '社保+公积金', desc: '缴纳/查询/提取', iconBg: 'rgba(0,83,205,0.1)', path: '' },
        { icon: '🏢', title: '工商管理', desc: '注册/变更/注销', iconBg: 'var(--color-secondary-container)', path: '' },
        { icon: '💰', title: '财税管理', desc: '报税/筹划/审计', iconBg: 'var(--color-error-container)', path: '' },
        { icon: '👥', title: '人力资源', desc: '招聘/培训/绩效', iconBg: 'rgba(0,83,205,0.1)', path: '/pages/enterprise/index' },
        { icon: '✅', title: '商业保险', desc: '理赔/咨询/方案', iconBg: 'rgba(161,59,0,0.1)', path: '' },
        { icon: '🧮', title: '工具计算器', desc: '个税/房贷/五险一金', iconBg: 'rgba(20,107,251,0.2)', path: '/pages/tax-calculator/index' }
      ],
      thirdPartyServices: [
        { icon: '⚖️', name: '人民法院在线服务', color: '#e31e24', url: '' },
        { icon: '🔨', name: '审判流程信息公开', color: '#e31e24', url: '' },
        { icon: '📖', name: '人民法院案例库', color: '#e31e24', url: '' },
        { icon: '🗄️', name: '国家法律法规数据库', color: '#8b1a1a', url: '' },
        { icon: '🤝', name: '多元调解', color: '#e31e24', url: '' },
        { icon: '🛡️', name: '中国律师身份核验', color: '#e31e24', url: '' },
        { icon: '📋', name: '国家企业信用信息', color: '#d4a017', url: '' },
        { icon: '📅', name: '放假安排', color: '#f39c12', url: '' }
      ]
    }
  },
  methods: {
    navigateTo(path) {
      if (path) {
        uni.navigateTo({ url: path })
      }
    },
    switchTab(index) {
      const tabs = ['/pages/index/index', '/pages/qa/index', '/pages/enterprise/index', '/pages/my/index']
      if (index === 0) return
      uni.navigateTo({ url: tabs[index] })
    },
    openExternal(url) {
      if (url) {
        // #ifdef H5
        window.open(url)
        // #endif
        // #ifndef H5
        uni.setClipboardData({
          data: url,
          success: () => uni.showToast({ title: '链接已复制', icon: 'none' })
        })
        // #endif
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: var(--margin-page);
  padding-bottom: 120rpx;
  background-color: var(--color-background);
  min-height: 100vh;
}

/* Banner */
.banner-section {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 280rpx;
  margin-bottom: var(--space-lg);
}
.banner-img {
  width: 100%;
  height: 100%;
}
.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-md);
  background: linear-gradient(to right, rgba(0,83,205,0.8), transparent);
}
.banner-title {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-primary);
  margin-bottom: 4px;
}
.banner-subtitle {
  font-size: var(--font-body-md);
  color: rgba(255,255,255,0.9);
}

/* 服务网格 */
.service-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.service-card {
  width: 48%;
  background-color: var(--color-surface-container-low);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 12px;
  box-sizing: border-box;
}
.service-card:active {
  transform: scale(0.98);
}
.service-card-wide {
  width: 100%;
}
.service-card-wide-inner {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.service-wide-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chevron-icon {
  color: var(--color-outline-variant);
  font-size: 24px;
}
.service-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}
.icon-text {
  font-size: 32rpx;
}
.service-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-on-surface);
  line-height: 1.3;
}
.service-desc {
  font-size: var(--font-caption);
  color: var(--color-secondary);
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  margin-bottom: var(--space-sm);
}
.section-indicator {
  width: 6rpx;
  height: 32rpx;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
}
.section-title {
  font-size: var(--font-h2);
  font-weight: 600;
  color: var(--color-on-surface);
}

/* 第三方服务 */
.third-party-grid {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: var(--space-lg);
}
.third-party-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8rpx;
  margin-bottom: 24rpx;
}
.third-party-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}
.third-party-emoji {
  font-size: 32rpx;
}
.third-party-name {
  font-size: var(--font-caption);
  color: var(--color-on-surface-variant);
  line-height: 1.3;
}

/* 底部导航 */
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
  padding: 0 var(--gutter-grid);
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rpx 16rpx;
}
.nav-icon {
  font-size: 44rpx;
  margin-bottom: 2rpx;
}
.nav-label {
  font-size: var(--font-label-sm);
  color: var(--color-secondary);
}
.nav-active .nav-label {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
