<template>
  <view class="page">
    <view class="container">
      <!-- Logo -->
      <view class="logo-section">
        <view class="logo-outer">
          <view class="logo-inner">
            <text class="logo-emoji">🏢</text>
          </view>
        </view>
        <text class="app-name">服务体系</text>
        <text class="app-desc">欢迎进入企业服务管理系统</text>
      </view>

      <!-- 装饰图 -->
      <view class="hero-image">
        <view class="hero-bg">
          <text class="hero-text-deco">🏙️</text>
        </view>
      </view>

      <!-- 按钮组 -->
      <view class="btn-group">
        <view class="btn-primary" @tap="goLogin">
          <text class="btn-primary-text">登录</text>
        </view>
        <view class="btn-outline" @tap="goRegister">
          <text class="btn-outline-text">立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  onShow() {
    // 已登录用户直接跳转首页
    const token = uni.getStorageSync('token')
    if (token) {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  },
  methods: {
    goLogin() {
      uni.navigateTo({ url: '/pages/login/index' })
    },
    goRegister() {
      uni.navigateTo({ url: '/pages/register-type/index' })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f8f6f6; }
.container { display: flex; flex-direction: column; min-height: 100vh; padding: 0 24px; }

.logo-section { display: flex; flex-direction: column; align-items: center; margin-top: 64px; margin-bottom: 32px; }
.logo-outer {
  width: 80px; height: 80px; border-radius: 12px;
  background: rgba(30,111,255,0.1); display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.logo-inner {
  width: 48px; height: 48px; border-radius: 8px;
  background: var(--color-primary); display: flex; align-items: center; justify-content: center;
}
.logo-emoji { font-size: 28px; }
.app-name { font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; }
.app-desc { font-size: 14px; color: #999; margin-top: 8px; }

.hero-image { width: 100%; aspect-ratio: 4/3; border-radius: 12px; overflow: hidden; margin-bottom: 32px; box-shadow: 0 4px 20px rgba(30,111,255,0.08); }
.hero-bg { width: 100%; height: 100%; background: linear-gradient(135deg, #e8f0fe 0%, #c2d9ff 100%); display: flex; align-items: center; justify-content: center; }
.hero-text-deco { font-size: 80px; }

.btn-group { display: flex; flex-direction: column; gap: 16px; margin-top: auto; margin-bottom: 60px; }
.btn-primary {
  height: 48px; border-radius: 12px; background: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,83,205,0.2);
}
.btn-primary-text { color: #fff; font-size: 16px; font-weight: 600; }
.btn-outline {
  height: 48px; border-radius: 12px; background: #fff;
  border: 2px solid var(--color-primary);
  display: flex; align-items: center; justify-content: center;
}
.btn-outline-text { color: var(--color-primary); font-size: 16px; font-weight: 600; }
</style>
