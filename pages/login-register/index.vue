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

      <!-- 协议 -->
      <view class="agreement-section">
        <view class="agreement-row" @tap="toggleAgree">
          <view class="checkbox" :class="{ checked: agreed }">
            <text v-if="agreed" class="check-mark">✓</text>
          </view>
          <text class="agreement-text">我已阅读并同意 <text class="link">《用户协议》</text>、<text class="link">《隐私政策》</text> 以及授权该应用使用我的基本信息。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { agreed: false }
  },
  methods: {
    toggleAgree() { this.agreed = !this.agreed },
    goLogin() {
      if (!this.agreed) {
        uni.showToast({ title: '请先同意用户协议', icon: 'none' })
        return
      }
      uni.navigateTo({ url: '/pages/login/index' })
    },
    goRegister() {
      if (!this.agreed) {
        uni.showToast({ title: '请先同意用户协议', icon: 'none' })
        return
      }
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

.btn-group { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
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

.agreement-section { margin-top: auto; padding-bottom: 40px; }
.agreement-row { display: flex; align-items: flex-start; gap: 12px; }
.checkbox {
  width: 20px; height: 20px; border: 2px solid #ccc; border-radius: 4px;
  display: flex; align-items: center; justify-content: center; margin-top: 2px;
}
.checkbox.checked { background: var(--color-primary); border-color: var(--color-primary); }
.check-mark { color: #fff; font-size: 14px; }
.agreement-text { font-size: 12px; color: #999; line-height: 1.6; }
.link { color: var(--color-primary); font-weight: 500; }
</style>
