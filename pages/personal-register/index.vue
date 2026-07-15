<template>
  <view class="page">
    <!-- 顶部导航 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">{{ isEdit ? '完善个人资料' : '个人注册' }}</text>
    </view> -->

    <!-- 主内容 -->
    <view class="main">
      <!-- Hero -->
      <view class="hero-section">
        <view class="hero-icon-wrap">
          <text class="hero-icon">👤</text>
        </view>
        <text class="hero-title">{{ isEdit ? '完善您的个人信息' : '开启您的服务之旅' }}</text>
        <text class="hero-desc">{{ isEdit ? '补充以下信息，让我们为您提供更精准的服务' : '请填写您的真实个人信息，以便完成实名核验' }}</text>
      </view>

      <!-- 头像编辑 -->
      <view class="avatar-section" v-if="isEdit">
        <view class="avatar-edit-wrap" @tap="chooseAvatar">
          <image class="avatar-preview" :src="avatarUrl || 'https://pic1.zhimg.com/v2-7d63e24e29ff2f3d8b7c6e7a4e5b5c5d_r.jpg'" mode="aspectFill" />
          <view class="avatar-edit-mask">
            <text class="avatar-edit-text">更换头像</text>
          </view>
        </view>
      </view>

      <!-- 表单 -->
      <view class="form-section">
        <!-- 联系电话（已登录，只读展示） -->
        <view class="form-group">
          <text class="form-label">联系电话</text>
          <view class="input-row">
            <text class="input-icon">📞</text>
            <text class="form-input phone-display">{{ userPhone || '未绑定' }}</text>
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
        <text class="submit-text">{{ isEdit ? '保存修改' : '提交注册' }}</text>
        <text class="submit-icon">{{ isEdit ? '✓' : '✓' }}</text>
      </view>

      <!-- 协议（仅注册模式显示） -->
      <view class="agreement-row" v-if="!isEdit" @tap="agreed = !agreed">
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
import { updateProfile, uploadFile } from '@/api/index.js'

export default {
  data() {
    return {
      isEdit: false,
      focusField: '',
      agreed: false,
      showPicker: false,
      submitting: false,
      userPhone: '',
      avatarUrl: '',
      form: { industry: '' },
      industries: ['金融保险', '互联网/技术', '教育培训', '医疗健康', '建筑房产', '其他行业']
    }
  },
  onLoad(options) {
    // 判断是否为编辑模式
    if (options && options.mode === 'edit') {
      this.isEdit = true
    }
    // 从 storage 读取已登录用户信息
    try {
      const userInfo = JSON.parse(uni.getStorageSync('userInfo') || '{}')
      this.userPhone = userInfo.phone || ''
      // 编辑模式预填已有资料
      if (this.isEdit) {
        this.form.industry = userInfo.occupation || ''
        this.avatarUrl = userInfo.avatar || ''
        this.agreed = true
      }
    } catch (e) {}
  },
  methods: {
    goBack() { uni.navigateBack() },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempPath = res.tempFilePaths[0]
          this.avatarUrl = tempPath // 先预览
          uni.showLoading({ title: '上传中...' })
          try {
            const uploadRes = await uploadFile(tempPath, 'avatar')
            this.avatarUrl = uploadRes.fileUrl
            // 立即更新头像到服务器
            await updateProfile({ avatar: uploadRes.fileUrl })
            // 更新本地缓存
            try {
              const cached = JSON.parse(uni.getStorageSync('userInfo') || '{}')
              cached.avatar = uploadRes.fileUrl
              uni.setStorageSync('userInfo', JSON.stringify(cached))
            } catch (e) {}
            uni.showToast({ title: '头像更新成功', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: '上传失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    },
    selectIndustry(name) {
      this.form.industry = name
      this.showPicker = false
    },
    async submitForm() {
      if (!this.isEdit && !this.agreed) {
        uni.showToast({ title: '请同意协议', icon: 'none' })
        return
      }
      if (this.submitting) return
      this.submitting = true
      try {
        // 如果选了行业，更新到个人资料
        if (this.form.industry) {
          await updateProfile({ occupation: this.form.industry })
        }
        uni.showToast({ title: this.isEdit ? '保存成功' : '注册成功', icon: 'success' })
        setTimeout(() => {
          if (this.isEdit) {
            uni.navigateBack()
          } else {
            uni.reLaunch({ url: '/pages/index/index?newUser=1' })
          }
        }, 1000)
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

.avatar-section { display: flex; justify-content: center; margin-bottom: 24px; }
.avatar-edit-wrap {
  position: relative; width: 96px; height: 96px; border-radius: 50%; overflow: hidden;
  border: 3px solid var(--color-primary-container); box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.avatar-preview { width: 100%; height: 100%; }
.avatar-edit-mask {
  position: absolute; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
}
.avatar-edit-text { color: #fff; font-size: 12px; font-weight: 500; }

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
.phone-display { font-size: 16px; color: var(--color-on-surface-variant); letter-spacing: 1px; }

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
