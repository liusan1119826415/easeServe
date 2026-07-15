<template>
  <view class="page">
    <!-- 顶部导航 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">{{ isEdit ? '完善企业资料' : '服务体系' }}</text>
      <view class="nav-right">
        <text class="more-icon">⋮</text>
      </view>
    </view> -->

    <!-- 主内容 -->
    <view class="main">
      <view class="form-header">
        <text class="form-title">{{ isEdit ? '企业资料完善' : '企业注册资料填写' }}</text>
        <text class="form-desc">{{ isEdit ? '请核对并更新您的企业证照信息' : '请核对您的企业证照信息，准确填写以下各项内容以完成入驻申请。' }}</text>
      </view>

      <!-- 表单 -->
      <view class="form-card">
        <!-- 统一社会信用代码 -->
        <view class="form-group">
          <text class="form-label">统一社会信用代码</text>
          <view class="input-wrap">
            <input class="form-input" v-model="socialCode" placeholder="请输入18位统一社会信用代码" />
            <text class="input-suffix">🛡️</text>
          </view>
        </view>

        <!-- 企业名称 -->
        <view class="form-group">
          <text class="form-label">企业名称</text>
          <view class="input-wrap">
            <input class="form-input" v-model="enterpriseName" placeholder="须与营业执照名称完全一致" />
            <text class="input-suffix">🏢</text>
          </view>
        </view>

        <!-- 联系方式 -->
        <view class="form-group">
          <text class="form-label">联系人姓名</text>
          <view class="input-wrap">
            <input class="form-input" v-model="contactName" placeholder="请输入联系人姓名" />
            <text class="input-suffix">👤</text>
          </view>
        </view>

        <!-- 联系电话 -->
        <view class="form-group">
          <text class="form-label">联系电话</text>
          <view class="input-wrap">
            <input class="form-input" type="number" v-model="contactPhone" placeholder="请输入手机号" maxlength="11" />
            <text class="input-suffix">📞</text>
          </view>
        </view>
      </view>

      <!-- 隐私说明 -->
      <view class="privacy-banner">
        <view class="privacy-bg">
          <text class="privacy-icon">🏙️</text>
        </view>
        <view class="privacy-overlay">
          <text class="privacy-text">您的隐私信息将受到金融级加密保护，仅用于企业身份核验与入驻流程。</text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <view class="submit-btn" @tap="submitForm">
          <text class="submit-text">{{ isEdit ? '保存修改' : '提交注册' }}</text>
          <text class="submit-arrow">→</text>
        </view>
        <text class="submit-tip" v-if="!isEdit">点击提交即表示您已阅读并同意 <text class="link">《企业服务条款》</text> 与 <text class="link">《隐私声明》</text></text>
      </view>
    </view>
  </view>
</template>

<script>
import { registerEnterprise } from '@/api/index.js'

export default {
  data() {
    return {
      isEdit: false,
      socialCode: '',
      enterpriseName: '',
      contactName: '',
      contactPhone: '',
      submitting: false
    }
  },
  onLoad(options) {
    // 判断是否为编辑模式
    if (options && options.mode === 'edit') {
      this.isEdit = true
    }
    // 动态设置导航栏标题
    uni.setNavigationBarTitle({
      title: this.isEdit ? '完善企业资料' : '企业注册'
    })
    // 预填已登录用户的手机号
    try {
      const userInfo = JSON.parse(uni.getStorageSync('userInfo') || '{}')
      this.contactPhone = userInfo.phone || ''
    } catch (e) {}
    // 编辑模式预填已有企业信息
    if (this.isEdit) {
      try {
        const ent = JSON.parse(uni.getStorageSync('enterpriseInfo') || '{}')
        if (ent.name) this.enterpriseName = ent.name
        if (ent.creditCode) this.socialCode = ent.creditCode
        if (ent.contactName) this.contactName = ent.contactName
        if (ent.contactPhone) this.contactPhone = ent.contactPhone
      } catch (e) {}
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    async submitForm() {
      if (!this.socialCode) {
        uni.showToast({ title: '请输入统一社会信用代码', icon: 'none' })
        return
      }
      if (!this.enterpriseName) {
        uni.showToast({ title: '请输入企业名称', icon: 'none' })
        return
      }
      if (!this.contactName) {
        uni.showToast({ title: '请输入联系人姓名', icon: 'none' })
        return
      }
      if (!this.contactPhone || this.contactPhone.length !== 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      if (this.submitting) return
      this.submitting = true
      try {
        await registerEnterprise({
          creditCode: this.socialCode,
          name: this.enterpriseName,
          contactName: this.contactName,
          contactPhone: this.contactPhone
        })
        uni.showToast({ title: this.isEdit ? '保存成功' : '提交成功，审核中', icon: 'success' })
        setTimeout(() => {
          if (this.isEdit) {
            uni.navigateBack()
          } else {
            uni.reLaunch({ url: '/pages/index/index?newUser=1' })
          }
        }, 1500)
      } catch (e) {
        // 错误已在 request 拦截器中提示
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-background); }
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; background: rgba(253,251,255,0.8);
  border-bottom: 1px solid var(--color-outline-variant);
}
.nav-icon { font-size: 20px; color: var(--color-primary); }
.nav-title { font-size: 18px; font-weight: 600; color: var(--color-primary); }
.more-icon { font-size: 20px; color: var(--color-on-surface-variant); }
.nav-right { }
.main { padding: 72px 24px 40px; max-width: 600px; margin: 0 auto; }

.form-header { margin-bottom: 32px; }
.form-title { font-size: 24px; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 8px; }
.form-desc { font-size: 14px; color: var(--color-on-surface-variant); }

.form-card { background: #fff; padding: 24px; border-radius: 12px; border: 1px solid rgba(195,199,207,0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.form-group { margin-bottom: 24px; }
.form-label { font-size: 14px; font-weight: 600; color: var(--color-on-surface-variant); display: block; margin-bottom: 8px; padding: 0 4px; }
.input-wrap { position: relative; display: flex; align-items: center; }
.form-input {
  width: 100%; height: 56px; background: #f2f3f5; border: none; border-radius: 12px;
  padding: 0 44px 0 16px; font-size: 14px; color: var(--color-primary);
}
.input-suffix { position: absolute; right: 16px; font-size: 18px; }
.contact-row { display: flex; gap: 8px; }
.flex-1 { flex: 1; }
.send-code-btn { height: 56px; padding: 0 16px; background: #f2f3f5; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.send-code-text { color: var(--color-primary); font-weight: 500; font-size: 14px; white-space: nowrap; }

.privacy-banner { position: relative; height: 192px; border-radius: 12px; overflow: hidden; margin: 32px 0; }
.privacy-bg { width: 100%; height: 100%; background: linear-gradient(135deg, #e3f2fd, #bbdefb); display: flex; align-items: center; justify-content: center; }
.privacy-icon { font-size: 60px; opacity: 0.5; }
.privacy-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,83,205,0.6), transparent); padding: 24px; }
.privacy-text { color: #fff; font-size: 12px; opacity: 0.9; }

.submit-section { padding-top: 16px; }
.submit-btn {
  width: 100%; height: 56px; background: var(--color-primary); border-radius: 12px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 4px 12px rgba(0,83,205,0.3);
}
.submit-text { color: #fff; font-size: 18px; font-weight: 700; }
.submit-arrow { color: #fff; font-size: 18px; }
.submit-tip { font-size: 12px; color: var(--color-on-surface-variant); text-align: center; margin-top: 16px; }
.link { color: var(--color-primary); text-decoration: underline; }
</style>
