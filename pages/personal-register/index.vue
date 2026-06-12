<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">个人注册</text>
    </view>

    <!-- 主内容 -->
    <view class="main">
      <!-- Hero -->
      <view class="hero-section">
        <view class="hero-icon-wrap">
          <text class="hero-icon">👤</text>
        </view>
        <text class="hero-title">开启您的服务之旅</text>
        <text class="hero-desc">请填写您的真实个人信息，以便完成实名核验</text>
      </view>

      <!-- 表单 -->
      <view class="form-section">
        <!-- 姓名 -->
        <view class="form-group">
          <text class="form-label">真实姓名</text>
          <view class="input-row" :class="{ focused: focusField === 'name' }">
            <text class="input-icon">👤</text>
            <input class="form-input" v-model="form.name" placeholder="请输入您的姓名" @focus="focusField='name'" @blur="focusField=''" />
          </view>
        </view>

        <!-- 身份证号 -->
        <view class="form-group">
          <text class="form-label">身份证号</text>
          <view class="input-row" :class="{ focused: focusField === 'idCard' }">
            <text class="input-icon">🪪</text>
            <input class="form-input" v-model="form.idCard" placeholder="请输入18位有效身份证号" maxlength="18" @focus="focusField='idCard'" @blur="focusField=''" />
          </view>
        </view>

        <!-- 联系电话 -->
        <view class="form-group">
          <text class="form-label">联系电话</text>
          <view class="input-row" :class="{ focused: focusField === 'phone' }">
            <text class="input-icon">📞</text>
            <input class="form-input" type="number" v-model="form.phone" placeholder="请输入您的手机号码" maxlength="11" @focus="focusField='phone'" @blur="focusField=''" />
            <view class="code-btn-sm" @tap="getCode">
              <text class="code-btn-sm-text">{{ countdown > 0 ? countdown + 's' : '获取验证码' }}</text>
            </view>
          </view>
        </view>

        <!-- 验证码 -->
        <view class="form-group">
          <text class="form-label">验证码</text>
          <view class="input-row" :class="{ focused: focusField === 'code' }">
            <text class="input-icon">🛡️</text>
            <input class="form-input" type="number" v-model="form.code" placeholder="请输入6位验证码" maxlength="6" @focus="focusField='code'" @blur="focusField=''" />
          </view>
        </view>

        <!-- 职业选择 -->
        <view class="form-group">
          <text class="form-label">职业 / 所属行业</text>
          <view class="input-row picker-row" @tap="showPicker = true">
            <text class="input-icon">💼</text>
            <text class="picker-text" :class="{ selected: form.industry }">{{ form.industry || '请选择您的所属行业' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </view>
      </view>

      <!-- 提交 -->
      <view class="submit-btn" @tap="submitForm">
        <text class="submit-text">提交注册</text>
        <text class="submit-icon">✓</text>
      </view>

      <!-- 协议 -->
      <view class="agreement-row" @tap="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">
          <text v-if="agreed" class="check-mark">✓</text>
        </view>
        <text class="agreement-text">我已阅读并同意 <text class="link">《用户服务协议》</text>、<text class="link">《隐私政策》</text> 以及 <text class="link">《实名认证授权声明》</text>，本人保证所填信息真实有效。</text>
      </view>
    </view>

    <!-- 行业选择弹窗 -->
    <view class="modal-mask" v-if="showPicker" @tap="showPicker = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">选择行业</text>
          <text class="modal-close" @tap="showPicker = false">✕</text>
        </view>
        <view class="industry-grid">
          <view class="industry-item" v-for="(ind, idx) in industries" :key="idx" @tap="selectIndustry(ind)">
            <text class="industry-text">{{ ind }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      focusField: '',
      agreed: false,
      showPicker: false,
      countdown: 0,
      timer: null,
      form: { name: '', idCard: '', phone: '', code: '', industry: '' },
      industries: ['金融保险', '互联网/技术', '教育培训', '医疗健康', '建筑房产', '其他行业']
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    getCode() {
      if (this.countdown > 0) return
      if (!this.form.phone || this.form.phone.length !== 11) {
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return
      }
      this.countdown = 60
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) clearInterval(this.timer)
      }, 1000)
      uni.showToast({ title: '验证码已发送', icon: 'success' })
    },
    selectIndustry(name) {
      this.form.industry = name
      this.showPicker = false
    },
    submitForm() {
      if (!this.form.name || !this.form.idCard || !this.form.phone || !this.form.code || !this.form.industry) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      if (!this.agreed) {
        uni.showToast({ title: '请同意协议', icon: 'none' })
        return
      }
      uni.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => { uni.switchTab({ url: '/pages/index/index' }) }, 1500)
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #faf9f9; }
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 48px; display: flex; align-items: center; gap: 16px;
  padding: 0 16px; background: var(--color-surface);
  border-bottom: 1px solid var(--color-surface-variant);
}
.nav-icon { font-size: 20px; color: var(--color-primary); }
.nav-title { font-size: 20px; font-weight: 600; color: var(--color-on-surface); }
.main { padding: 64px 16px 40px; }

.hero-section { text-align: center; padding: 24px 0 32px; }
.hero-icon-wrap {
  width: 64px; height: 64px; border-radius: 12px; background: var(--color-primary-container);
  display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
}
.hero-icon { font-size: 32px; }
.hero-title { font-size: 24px; font-weight: 600; color: var(--color-on-surface); display: block; margin-bottom: 4px; }
.hero-desc { font-size: 14px; color: var(--color-secondary); }

.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-group { }
.form-label { font-size: 12px; font-weight: 500; color: var(--color-on-surface-variant); display: block; margin-bottom: 8px; padding: 0 4px; }
.input-row {
  display: flex; align-items: center; background: #f8f9fa;
  border: 1px solid transparent; border-radius: 12px; padding: 12px 16px; gap: 12px;
}
.input-row.focused { border-color: #1e6fff; background: #fff; }
.input-icon { font-size: 20px; }
.form-input { background: transparent; border: none; font-size: 16px; flex: 1; color: var(--color-on-surface); }

.code-btn-sm { padding: 6px 16px; border: 1px solid var(--color-primary); border-radius: 12px; }
.code-btn-sm-text { font-size: 12px; color: var(--color-primary); font-weight: 500; white-space: nowrap; }

.picker-row { cursor: pointer; }
.picker-text { font-size: 16px; flex: 1; color: var(--color-outline); }
.picker-text.selected { color: var(--color-on-surface); }
.picker-arrow { font-size: 14px; color: var(--color-secondary); }

.submit-btn {
  width: 100%; height: 48px; background: var(--color-primary); border-radius: 12px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 32px; box-shadow: 0 4px 12px rgba(0,83,205,0.3);
}
.submit-text { color: #fff; font-size: 18px; font-weight: 600; }
.submit-icon { color: #fff; font-size: 18px; }

.agreement-row { display: flex; align-items: flex-start; gap: 8px; margin-top: 24px; padding: 0 8px; }
.checkbox {
  width: 16px; height: 16px; border: 2px solid var(--color-outline); border-radius: 4px;
  display: flex; align-items: center; justify-content: center; margin-top: 2px; flex-shrink: 0;
}
.checkbox.checked { background: var(--color-primary); border-color: var(--color-primary); }
.check-mark { color: #fff; font-size: 12px; }
.agreement-text { font-size: 11px; color: var(--color-secondary); line-height: 1.6; }
.link { color: var(--color-primary); }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: flex-end; }
.modal-content { width: 100%; background: var(--color-surface); border-radius: 24px 24px 0 0; padding: 24px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); }
.modal-close { font-size: 18px; color: var(--color-secondary); }
.industry-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.industry-item {
  width: calc(50% - 6px); padding: 16px; border-radius: 12px;
  border: 1px solid var(--color-surface-variant); text-align: center;
}
.industry-text { font-size: 14px; color: var(--color-on-surface); }
</style>
