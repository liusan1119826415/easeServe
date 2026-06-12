<template>
  <view class="page-container">
    <!-- 用户头像区 -->
    <view class="profile-section">
      <view class="avatar-wrap">
        <image class="avatar" src="/static/logo.png" mode="aspectFill" />
      </view>
      <view class="profile-info">
        <text class="user-name">李先生</text>
        <view class="login-btn" @tap="goLogin">
          <text class="login-btn-text">点击登录</text>
        </view>
      </view>
    </view>

    <!-- VIP 会员卡 -->
    <view class="vip-card" @tap="goMembership">
      <view class="vip-header">
        <view class="vip-left">
          <text class="vip-icon">⭐</text>
          <text class="vip-title">VIP 会员</text>
        </view>
        <text class="vip-tag">专属特权</text>
      </view>
      <text class="vip-detail">月套餐 · 剩余3次咨询</text>
      <view class="vip-footer">
        <view class="vip-renew-btn">
          <text class="vip-renew-text">立即续费</text>
        </view>
      </view>
      <view class="vip-decor"></view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view class="menu-item" v-for="(item, i) in menuList" :key="i" @tap="goMenu(item)">
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-label">{{ item.label }}</text>
        </view>
        <text class="menu-chevron">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" @tap="handleLogout">
      <text class="logout-text">退出登录</text>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav safe-area-bottom">
      <view class="nav-item" @tap="switchTab(0)">
        <text class="nav-icon">🏠</text><text class="nav-label">首页</text>
      </view>
      <view class="nav-item" @tap="switchTab(1)">
        <text class="nav-icon">💬</text><text class="nav-label">智能问答</text>
      </view>
      <view class="nav-item" @tap="switchTab(2)">
        <text class="nav-icon">💼</text><text class="nav-label">企业信息</text>
      </view>
      <view class="nav-item nav-active" @tap="switchTab(3)">
        <text class="nav-icon">👤</text><text class="nav-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        { icon: '📋', label: '我的订单', path: '/pages/orders/index' },
        { icon: '💬', label: '我的咨询', path: '/pages/my-consultations/index' },
        { icon: '❤️', label: '我的收藏', path: '/pages/favorites/index' },
        { icon: '📦', label: '套餐管理', path: '/pages/membership/index' },
        { icon: '🎧', label: '联系客服', path: '/pages/contact/index' },
        { icon: '🔗', label: '推荐分享', path: '/pages/share-poster/index' }
      ]
    }
  },
  methods: {
    goLogin() {
      uni.navigateTo({ url: '/pages/login-register/index' })
    },
    goMembership() {
      uni.navigateTo({ url: '/pages/membership/index' })
    },
    goMenu(item) {
      if (item.path) uni.navigateTo({ url: item.path })
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '已退出', icon: 'none' })
          }
        }
      })
    },
    switchTab(index) {
      const tabs = ['/pages/index/index', '/pages/qa/index', '/pages/enterprise/index', '/pages/my/index']
      if (index === 3) return
      uni.navigateTo({ url: tabs[index] })
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-background);
  min-height: 100vh;
  padding: var(--space-md);
  padding-bottom: 130rpx;
}
.profile-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}
.avatar-wrap {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-surface-container-high);
}
.avatar { width: 100%; height: 100%; }
.user-name {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
  margin-bottom: 4rpx;
}
.login-btn {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  padding: 8rpx 28rpx;
  border-radius: var(--radius-full);
  width: fit-content;
}
.login-btn-text {
  font-size: var(--font-label-sm);
  font-weight: 500;
  color: var(--color-on-primary);
}
.vip-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-md);
}
.vip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.vip-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.vip-icon { font-size: 36rpx; }
.vip-title {
  font-size: var(--font-h2);
  font-weight: 600;
  color: var(--color-on-primary);
}
.vip-tag {
  font-size: var(--font-caption);
  color: rgba(255,255,255,0.8);
}
.vip-detail {
  font-size: var(--font-body-lg);
  font-weight: 600;
  color: var(--color-on-primary);
  display: block;
}
.vip-footer {
  margin-top: 16rpx;
  display: flex;
  justify-content: flex-end;
}
.vip-renew-btn {
  background-color: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 6rpx 24rpx;
  border-radius: var(--radius-full);
}
.vip-renew-text {
  font-size: var(--font-label-sm);
  color: var(--color-on-primary);
}
.vip-decor {
  position: absolute;
  right: -32rpx;
  bottom: -32rpx;
  width: 160rpx;
  height: 160rpx;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}
.menu-section {
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-outline-variant);
}
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background-color: rgba(223,226,237,0.2); }
.menu-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.menu-icon { font-size: 36rpx; }
.menu-label {
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
}
.menu-chevron {
  font-size: 28rpx;
  color: var(--color-secondary);
}
.logout-btn {
  margin-top: var(--space-lg);
  background-color: var(--color-surface-container-lowest);
  padding: 28rpx 0;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
}
.logout-text {
  color: var(--color-error);
  font-size: var(--font-h2);
  font-weight: 600;
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
