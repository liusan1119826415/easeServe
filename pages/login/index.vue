<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">✕</text>
      </view>
      <text class="nav-title">登录</text>
      <view class="nav-right"></view>
    </view>

    <!-- 主内容 -->
    <view class="main">
      <!-- Logo -->
      <view class="logo-section">
        <view class="logo-wrap">
          <text class="logo-emoji">🏢</text>
        </view>
        <text class="welcome-text">欢迎登录服务体系</text>
      </view>

      <!-- 表单 -->
      <view class="form-section">
        <!-- 手机号 -->
        <view class="input-group">
          <view class="input-row" :class="{ focused: phoneFocused }">
            <text class="area-code">+86</text>
            <view class="divider"></view>
            <input class="input-field" type="number" placeholder="请输入手机号码" v-model="phone" @focus="phoneFocused=true" @blur="phoneFocused=false" maxlength="11" />
          </view>
        </view>

        <!-- 验证码 -->
        <view class="code-row">
          <view class="input-row code-input" :class="{ focused: codeFocused }">
            <input class="input-field" type="number" placeholder="请输入验证码" v-model="code" @focus="codeFocused=true" @blur="codeFocused=false" maxlength="6" />
          </view>
          <view class="code-btn" :class="{ disabled: countdown > 0 }" @tap="getCode">
            <text class="code-btn-text">{{ countdown > 0 ? countdown + 's 后重试' : '获取验证码' }}</text>
          </view>
        </view>

        <!-- 登录按钮 -->
        <view class="login-btn" @tap="handleLogin">
          <text class="login-btn-text">登录 / 注册</text>
        </view>
      </view>

      <!-- 协议 -->
      <view class="agreement-section">
        <view class="agreement-row" @tap="toggleAgree">
          <view class="checkbox" :class="{ checked: agreed }">
            <text v-if="agreed" class="check-mark">✓</text>
          </view>
          <text class="agreement-text">我已阅读并同意 <text class="link" @tap.stop="openAgreement('user')">《用户服务协议》</text> 与 <text class="link" @tap.stop="openAgreement('privacy')">《隐私保护政策》</text></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phone: '',
      code: '',
      agreed: false,
      countdown: 0,
      phoneFocused: false,
      codeFocused: false,
      timer: null
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    getCode() {
      if (this.countdown > 0) return
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      this.countdown = 60
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) clearInterval(this.timer)
      }, 1000)
      uni.showToast({ title: '验证码已发送', icon: 'success' })
    },
    handleLogin() {
      if (!this.agreed) {
        uni.showToast({ title: '请先阅读并同意用户协议', icon: 'none' })
        return
      }
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      if (!this.code || this.code.length < 4) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return
      }
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => { uni.switchTab({ url: '/pages/index/index' }) }, 1000)
    },
    toggleAgree() { this.agreed = !this.agreed },
    openAgreement(type) {
      uni.showToast({ title: type === 'user' ? '用户协议' : '隐私政策', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-background); }
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: var(--color-surface-container-lowest);
  border-bottom: 1px solid var(--color-outline-variant);
}
.nav-icon { font-size: 18px; color: var(--color-on-surface); }
.nav-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); }
.nav-right { width: 24px; }
.main { padding: 56px 24px 40px; display: flex; flex-direction: column; min-height: 100vh; }

.logo-section { display: flex; flex-direction: column; align-items: center; margin-top: 40px; margin-bottom: 48px; }
.logo-wrap {
  width: 80px; height: 80px; border-radius: 12px; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,83,205,0.1); margin-bottom: 16px;
}
.logo-emoji { font-size: 40px; }
.welcome-text { font-size: 20px; font-weight: 700; color: var(--color-on-surface); }

.form-section { max-width: 400px; width: 100%; margin: 0 auto; }
.input-group { margin-bottom: 16px; }
.input-row {
  display: flex; align-items: center; height: 56px;
  background: var(--color-surface-container-low); border-radius: 12px;
  padding: 0 16px; border: 1px solid transparent; transition: border-color 0.2s;
}
.input-row.focused { border-color: var(--color-primary); }
.area-code { font-size: 16px; font-weight: 500; color: var(--color-on-surface); margin-right: 12px; }
.divider { width: 1px; height: 24px; background: var(--color-outline-variant); margin-right: 12px; }
.input-field { background: transparent; border: none; font-size: 16px; flex: 1; color: var(--color-on-surface); }

.code-row { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
.code-input { flex: 1; }
.code-btn {
  height: 56px; padding: 0 16px; background: rgba(0,83,205,0.1);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
}
.code-btn.disabled { opacity: 0.5; }
.code-btn-text { color: var(--color-primary); font-weight: 500; font-size: 14px; white-space: nowrap; }

.login-btn {
  width: 100%; height: 56px; background: var(--color-primary);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  margin-top: 24px; box-shadow: 0 4px 12px rgba(0,83,205,0.3);
}
.login-btn-text { color: #fff; font-size: 16px; font-weight: 700; }

.agreement-section { margin-top: auto; padding-top: 60px; display: flex; justify-content: center; }
.agreement-row { display: flex; align-items: flex-start; gap: 12px; }
.checkbox {
  width: 20px; height: 20px; border: 2px solid var(--color-outline);
  border-radius: 4px; display: flex; align-items: center; justify-content: center;
  margin-top: 2px; transition: all 0.2s;
}
.checkbox.checked { background: var(--color-primary); border-color: var(--color-primary); }
.check-mark { color: #fff; font-size: 14px; }
.agreement-text { font-size: 12px; color: var(--color-on-surface-variant); line-height: 1.6; max-width: 280px; }
.link { color: var(--color-primary); font-weight: 500; }
</style>
