<template>
  <view class="page">
    <!-- 顶部导航 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">✕</text>
      </view>
      <text class="nav-title">{{ mode === 'register' ? '注册' : '登录' }}</text>
      <view class="nav-right"></view>
    </view> -->

    <!-- 主内容 -->
    <view class="main">
      <!-- Logo -->
      <view class="logo-section">
        <view class="logo-wrap">
          <text class="logo-emoji">🏢</text>
        </view>
        <text class="welcome-text">{{ mode === 'register' ? '注册服务体系' : '欢迎登录服务体系' }}</text>
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
          <text class="login-btn-text">{{ mode === 'register' ? '注册 / 登录' : '登录 / 注册' }}</text>
        </view>

        <!-- 微信一键登录（仅小程序环境显示） -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="wx-divider">
          <view class="wx-divider-line"></view>
          <text class="wx-divider-text">或</text>
          <view class="wx-divider-line"></view>
        </view>
        <button class="wx-login-btn" :class="{ disabled: wxLoading }" open-type="getPhoneNumber" @getphonenumber="handleWxLogin">
          <image src="/static/wechat-icon.svg" class="wx-login-icon" mode="aspectFit" />
          <text class="wx-login-text">{{ wxLoading ? '登录中...' : '微信一键登录' }}</text>
        </button>
        <!-- #endif -->
      </view>

      <!-- 协议区域 -->
      <view class="agreement-section" v-if="mode === 'login'">
        <view class="agreement-check" @tap="agreed = !agreed">
          <view class="check-icon" :class="{ active: agreed }">
            <text class="check-text" v-if="agreed">✓</text>
          </view>
          <text class="agreement-text">
            我已阅读并同意
            <text class="link" @tap.stop="showAgreement('user')">《用户服务协议》</text>
            和
            <text class="link" @tap.stop="showAgreement('privacy')">《隐私保护协议》</text>
          </text>
        </view>
      </view>
    </view>

    <!-- 协议弹窗 -->
    <agreement-popup
      v-if="agreementType"
      :type="agreementType"
      @close="agreementType = ''"
    />

    <!-- 滑动验证弹窗 -->
    <zmm-slider-verify
      ref="sliderVerify"
      title="安全验证"
      tips="请将滑块拖动到缺口位置"
      :showBottomSlider="false"
      @success="onCaptchaVerify"
    />
  </view>
</template>

<script>
import { sendSmsCode, login, wxLogin } from '@/api'
import ZmmSliderVerify from '@/uni_modules/zmm-slider-verify/components/zmm-slider-verify/zmm-slider-verify.vue'

export default {
  components: { ZmmSliderVerify },
  data() {
    return {
      phone: '',
      code: '',
      mode: 'login', // login | register
      agreed: false,
      agreementType: '',
      phoneFocused: false,
      codeFocused: false,
      countdown: 0,
      wxLoading: false,
      sending: false
    }
  },
  onLoad(options) {
    this.mode = options.mode || 'login'
    // 动态设置导航栏标题
    uni.setNavigationBarTitle({
      title: this.mode === 'register' ? '注册' : '登录'
    })
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },

    showAgreement(type) {
      this.agreementType = type
    },

    async getCode() {
      if (this.countdown > 0) return
      if (!this.phone) {
        uni.showToast({ title: '请输入手机号码', icon: 'none' })
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        uni.showToast({ title: '请输入正确的手机号码', icon: 'none' })
        return
      }

      // 弹出滑动验证
      this.$refs['sliderVerify'].show()
    },

    async onCaptchaVerify() {
      if (this.sending) return
      this.sending = true
      this.$refs['sliderVerify'].hide()
      try {
        await sendSmsCode({ phone: this.phone, type: this.mode })
        uni.showToast({ title: '验证码已发送', icon: 'none' })
        this.countdown = 60
        const timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) clearInterval(timer)
        }, 1000)
      } catch (e) {
        uni.showToast({ title: '发送失败，请稍后重试', icon: 'none' })
      } finally {
        this.sending = false
      }
    },

    async handleLogin() {
      if (!this.phone) {
        uni.showToast({ title: '请输入手机号码', icon: 'none' })
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        uni.showToast({ title: '请输入正确的手机号码', icon: 'none' })
        return
      }
      if (!this.code) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return
      }
      if (this.mode === 'login' && !this.agreed) {
        uni.showToast({ title: '请先同意服务协议和隐私保护协议', icon: 'none' })
        return
      }

      try {
        const res = await login({
          phone: this.phone,
          code: this.code,
          loginType: 'sms'
        })

        // 保存 token（拦截器已解包，res 直接是 {token, user, isNewUser}）
        uni.setStorageSync('token', res.token)
        uni.setStorageSync('userInfo', res.user)

        uni.showToast({ title: this.mode === 'register' ? '注册成功' : '登录成功', icon: 'none' })

        // 返回上一页，若无历史则跳转首页
        setTimeout(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            uni.navigateBack()
          } else {
            uni.reLaunch({ url: '/pages/index/index' })
          }
        }, 500)
      } catch (e) {
        uni.showToast({ title: e.message || '登录失败', icon: 'none' })
      }
    },

    // 微信一键登录（通过 getPhoneNumber 获取微信绑定手机号）
    async handleWxLogin(e) {
      const detail = e.detail || {}
      console.log('[handleWxLogin] e.detail =', JSON.stringify(detail))

      // 判断授权结果
      const errMsg = detail.errMsg || ''
      // errMsg 格式: "getPhoneNumber:ok" 或 "getPhoneNumber:fail deny"
      if (errMsg.indexOf('fail') !== -1) {
        uni.showToast({ title: '需要授权手机号才能登录', icon: 'none' })
        return
      }

      if (this.wxLoading) return
      this.wxLoading = true
      // 点击微信登录即视为同意协议
      this.agreed = true
      try {
        // 新接口返回 code，旧接口返回 encryptedData + iv
        const phoneCode = detail.code || ''
        if (!phoneCode && !detail.encryptedData) {
          uni.showToast({ title: '获取手机号失败，请升级微信版本', icon: 'none' })
          return
        }
        // 调用 wx.login 获取登录 code
        const loginRes = await uni.login({ provider: 'weixin' })
        if (!loginRes || !loginRes.code) {
          uni.showToast({ title: '微信登录失败', icon: 'none' })
          return
        }
        // 调用后端接口，传入 login code + phoneCode
        const res = await wxLogin(loginRes.code, phoneCode)
        // 保存 token（拦截器已解包，res 直接是 {token, user, isNewUser}）
        uni.setStorageSync('token', res.token)
        uni.setStorageSync('userInfo', res.user)
        uni.showToast({ title: '登录成功', icon: 'none' })
        setTimeout(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            uni.navigateBack()
          } else {
            uni.reLaunch({ url: '/pages/index/index' })
          }
        }, 500)
      } catch (err) {
        uni.showToast({ title: err.message || '微信登录失败', icon: 'none' })
      } finally {
        this.wxLoading = false
      }
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}

.main {
  padding: 60rpx 40rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 60rpx;
}

.logo-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #165dff, #4080ff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24rpx;
}

.logo-emoji {
  font-size: 56rpx;
}

.welcome-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #1d2129;
}

.form-section {
  margin-bottom: 40rpx;
}

.input-group {
  margin-bottom: 24rpx;
}

.input-row {
  display: flex;
  align-items: center;
  background: #f2f3f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 96rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.input-row.focused {
  background: #fff;
  border-color: #165dff;
}

.area-code {
  font-size: 30rpx;
  font-weight: 500;
  color: #1d2129;
  margin-right: 16rpx;
}

.divider {
  width: 2rpx;
  height: 36rpx;
  background: #c9cdd4;
  margin-right: 16rpx;
}

.input-field {
  flex: 1;
  font-size: 30rpx;
  color: #1d2129;
}

.code-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 220rpx;
  height: 96rpx;
  background: #f2f3f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-btn.disabled {
  opacity: 0.5;
}

.code-btn-text {
  font-size: 26rpx;
  color: #165dff;
  font-weight: 500;
}

.login-btn {
  height: 96rpx;
  background: linear-gradient(135deg, #165dff, #4080ff);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.agreement-section {
  margin-top: 32rpx;
}

.agreement-check {
  display: flex;
  align-items: flex-start;
}

.check-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #c9cdd4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  margin-top: 4rpx;
  flex-shrink: 0;
}

.check-icon.active {
  background: #165dff;
  border-color: #165dff;
}

.check-text {
  font-size: 20rpx;
  color: #fff;
}

.agreement-text {
  font-size: 24rpx;
  color: #86909c;
  line-height: 1.6;
}

.link {
  color: #165dff;
}

/* 微信登录样式 */
.wx-divider {
  display: flex;
  align-items: center;
  margin: 40rpx 0 32rpx;
}

.wx-divider-line {
  flex: 1;
  height: 1rpx;
  background: #e5e6eb;
}

.wx-divider-text {
  padding: 0 24rpx;
  font-size: 26rpx;
  color: #86909c;
}

.wx-login-btn {
  height: 96rpx;
  background: #07c160;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  /* 重置 button 默认样式 */
  padding: 0;
  margin: 0;
  border: none;
  line-height: normal;
  color: #fff;
  font-size: inherit;
}

.wx-login-btn::after {
  border: none;
}

.wx-login-btn.disabled {
  opacity: 0.6;
}

.wx-login-icon {
  width: 40rpx;
  height: 40rpx;
}

.wx-login-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}
</style>
