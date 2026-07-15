<template>
  <view class="page">
    <!-- 顶部导航 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">选择注册类型</text>
      <view class="nav-right"></view>
    </view> -->

    <!-- 主内容 -->
    <view class="main">
      <view class="header-text">
        <text class="header-title">欢迎加入我们</text>
        <text class="header-desc">请选择最符合您身份的注册类型，以便我们为您提供精准的服务体验。</text>
      </view>

      <!-- 选择卡片 -->
      <view class="card-list">
        <view class="type-card" :class="{ active: selected === 'individual' }" @tap="selectType('individual')">
          <view class="type-icon-wrap blue">
            <text class="type-icon">👤</text>
          </view>
          <text class="type-desc">适用于寻求个人服务、自由职业者或独立开发者。享受个性化配置与快速部署工具。</text>
          <view class="type-action">
            <text class="type-action-text">立即开始</text>
            <text class="type-arrow">→</text>
          </view>
        </view>

        <view class="type-card" :class="{ active: selected === 'enterprise' }" @tap="selectType('enterprise')">
          <view class="type-icon-wrap dark">
            <text class="type-icon">💼</text>
          </view>
          <text class="type-desc">适用于公司团体与组织。包含多账号管理、合规性审计以及企业级SLA保障。</text>
          <view class="type-action">
            <text class="type-action-text">开启企业之旅</text>
            <text class="type-arrow">→</text>
          </view>
        </view>
      </view>

      <!-- 底部装饰 -->
      <view class="bottom-banner">
        <view class="banner-overlay">
          <text class="banner-text">🏙️</text>
        </view>
        <view class="banner-info">
          <text class="banner-info-text">加入全球 50,000+ 企业与个人的信任选择</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { selected: '', pendingType: '' }
  },
  onShow() {
    // 登录成功后如果带了 pending 标记，自动继续注册流程
    const pendingType = uni.getStorageSync('pendingRegisterType')
    if (pendingType) {
      uni.removeStorageSync('pendingRegisterType')
      this.selectType(pendingType)
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    selectType(type) {
      // 检查是否已登录
      const token = uni.getStorageSync('token')
      if (!token) {
        // 未登录，记住选择的类型，跳转登录
        uni.setStorageSync('pendingRegisterType', type)
        uni.navigateTo({ url: '/pages/login/index?mode=register' })
        return
      }

      this.selected = type
      setTimeout(() => {
        if (type === 'individual') {
          uni.navigateTo({ url: '/pages/personal-register/index' })
        } else {
          uni.navigateTo({ url: '/pages/enterprise-register/index' })
        }
      }, 300)
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-background); }
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; background: var(--color-surface-container-lowest);
  border-bottom: 1px solid var(--color-outline-variant);
}
.nav-icon { font-size: 20px; color: var(--color-primary); }
.nav-title { font-size: 18px; font-weight: 600; color: var(--color-primary); position: absolute; left: 50%; transform: translateX(-50%); }
.nav-right { width: 24px; }
.main { padding: 20px 24px 48px; max-width: 600px; margin: 0 auto; }

.header-text { text-align: center; margin-bottom: 40px; }
.header-title { font-size: 28px; font-weight: 800; color: var(--color-on-surface); display: block; margin-bottom: 12px; }
.header-desc { font-size: 14px; color: var(--color-on-surface-variant); line-height: 1.6; }

.card-list { display: flex; flex-direction: column; gap: 24px; }
.type-card {
  background: #fff; border: 2px solid transparent; border-radius: 24px;
  padding: 32px; display: flex; flex-direction: column; align-items: flex-start;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.3s;
}
.type-card.active { border-color: var(--color-primary); }
.type-icon-wrap {
  width: 64px; height: 64px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
}
.type-icon-wrap.blue { background: rgba(0,83,205,0.1); }
.type-icon-wrap.dark { background: var(--color-primary); }
.type-icon { font-size: 32px; }
.type-desc { font-size: 14px; color: var(--color-on-surface-variant); line-height: 1.6; margin-bottom: 24px; max-width: 80%; }
.type-action { display: flex; align-items: center; }
.type-action-text { font-size: 14px; color: var(--color-primary); font-weight: 600; }
.type-arrow { font-size: 14px; color: var(--color-primary); margin-left: 8px; }

.bottom-banner { margin-top: 48px; border-radius: 24px; overflow: hidden; height: 192px; position: relative; }
.banner-overlay {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 50%, #669df6 100%);
  display: flex; align-items: center; justify-content: center;
}
.banner-text { font-size: 80px; opacity: 0.3; }
.banner-info {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
  padding: 24px;
}
.banner-info-text { color: #fff; font-size: 14px; font-weight: 500; }
</style>
