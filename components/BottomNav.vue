<template>
  <view class="bottom-nav safe-area-bottom">
    <view class="nav-item" :class="{ 'nav-active': active === 0 }" @tap="goTab(0)">
      <text class="nav-icon">🏠</text>
      <text class="nav-label">首页</text>
    </view>
    <view class="nav-item" :class="{ 'nav-active': active === 1 }" @tap="goTab(1)">
      <text class="nav-icon">💬</text>
      <text class="nav-label">智能问答</text>
    </view>
    <view class="nav-item" :class="{ 'nav-active': active === 2 }" @tap="goTab(2)">
      <text class="nav-icon">💼</text>
      <text class="nav-label">企业信息</text>
    </view>
    <view class="nav-item" :class="{ 'nav-active': active === 3 }" @tap="goTab(3)">
      <text class="nav-icon">👤</text>
      <text class="nav-label">我的</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BottomNav',
  props: {
    active: { type: Number, default: 0 }
  },
  methods: {
    goTab(index) {
      if (index === this.active) return
      const tabs = ['/pages/index/index', '/pages/qa/index', '/pages/company-info/index', '/pages/my/index']
      uni.navigateTo({ url: tabs[index] })
    }
  }
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: #ffffff;
  border-top: 1px solid #c2c6d8;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 110rpx;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.nav-icon {
  font-size: 44rpx;
  margin-bottom: 2rpx;
}
.nav-label {
  font-size: 22rpx;
  color: #5b5f65;
}
.nav-active .nav-label {
  color: #0053cd;
  font-weight: 600;
}
</style>
