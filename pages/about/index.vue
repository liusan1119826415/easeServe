<template>
  <view class="page-container">
    <!-- 大图 Banner -->
    <view class="hero-banner">
      <image class="hero-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxkiqhZzl1xJCXskyVy552vUeU395AR6ZI2AG2CJCSv6L6DLd9c3sFl0HfCp3H5r2kCYCV8BBb_uRbc9VJyo8urPADqAb6kRLvNuf9WdvcPwUOOWh9Gb3onXO8gPkid0AU3Zl5moosgCy8sobvznevKUHm_BD7OAImuNwnJbH_w4mXPnEqVqfMS8vKnRwdQJcoIOH_dPi-i-IT9GmfwTL03tpvqweGWiUPv__BHRzL_-Jtr3Urza_y0-_paFVAiEw4k3hJa12PbP-5" mode="aspectFill" />
      <view class="hero-overlay">
        <text class="hero-title">智慧服务，链接未来</text>
        <text class="hero-subtitle">为您提供全方位的政务与企业服务保障</text>
      </view>
    </view>

    <!-- 企业概况 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-bar"></view>
        <text class="section-title">企业概况</text>
      </view>
      <text class="section-text">我们是国内领先的一站式政务与企业服务平台，致力于通过AI技术与数字化手段，优化传统服务体系。凭借多年的行业积累，我们已成功助力数万家企业实现数字化转型与高效办公。</text>
      <view class="feature-list">
        <view class="feature-item" v-for="(f, i) in features" :key="i">
          <text class="feature-icon">{{ f.icon }}</text>
          <text class="feature-text">{{ f.text }}</text>
        </view>
      </view>
    </view>

    <!-- 联系我们 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-bar"></view>
        <text class="section-title">联系我们</text>
      </view>
      <view class="contact-item" @tap="callPhone">
        <view class="contact-left">
          <text class="contact-icon">📞</text>
          <view class="contact-info">
            <text class="contact-label">服务热线</text>
            <text class="contact-value">0731-XXXXXXX</text>
          </view>
        </view>
        <view class="contact-action">
          <text class="contact-action-text">拨打</text>
        </view>
      </view>
      <view class="contact-item" @tap="copyWechat">
        <view class="contact-left">
          <text class="contact-icon">💬</text>
          <view class="contact-info">
            <text class="contact-label">在线微信</text>
            <text class="contact-value">cs12333</text>
          </view>
        </view>
        <view class="contact-action">
          <text class="contact-action-text">复制</text>
        </view>
      </view>
      <view class="contact-footer">
        <text class="contact-footer-text">若您需要深度定制或复杂政策咨询，建议进行线下预约</text>
        <view class="btn-outline-primary" @tap="goAppointment">
          <text>复杂咨询请预约线下服务</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      features: [
        { icon: '🛡️', text: '官方认证资质，确保信息安全与服务专业度。' },
        { icon: '📊', text: '大数据智能驱动，精准匹配您的各项业务需求。' },
        { icon: '👥', text: '千人级专家智库，在线为您解答复杂政策疑难。' }
      ]
    }
  },
  methods: {
    callPhone() {
      uni.makePhoneCall({ phoneNumber: '0731-XXXXXXX' })
    },
    copyWechat() {
      uni.setClipboardData({ data: 'cs12333', success: () => uni.showToast({ title: '已复制微信号', icon: 'success' }) })
    },
    goAppointment() {
      uni.showToast({ title: '预约功能开发中', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-background);
  min-height: 100vh;
  padding: var(--space-md);
}
.hero-banner {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-md);
  height: 320rpx;
}
.hero-img { width: 100%; height: 100%; }
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-md);
}
.hero-title { font-size: var(--font-h1); font-weight: 600; color: #fff; margin-bottom: 4rpx; }
.hero-subtitle { font-size: var(--font-body-md); color: rgba(255,255,255,0.9); }
.section-card {
  background-color: var(--color-surface-container-lowest);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-md);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: var(--space-md);
}
.section-bar { width: 10rpx; height: 40rpx; background-color: var(--color-primary); border-radius: var(--radius-full); }
.section-title { font-size: var(--font-h2); font-weight: 600; color: var(--color-on-surface); }
.section-text { font-size: var(--font-body-md); color: var(--color-on-surface-variant); line-height: 1.7; display: block; margin-bottom: var(--space-md); }
.feature-list { display: flex; flex-direction: column; gap: var(--space-sm); }
.feature-item { display: flex; align-items: flex-start; gap: 12rpx; }
.feature-icon { font-size: 32rpx; margin-top: 2rpx; }
.feature-text { font-size: var(--font-body-md); color: var(--color-on-surface-variant); flex: 1; }
.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
}
.contact-left { display: flex; align-items: center; gap: 12rpx; }
.contact-icon { font-size: 32rpx; }
.contact-label { font-size: var(--font-caption); color: var(--color-secondary); display: block; }
.contact-value { font-size: var(--font-body-lg); color: var(--color-on-surface); font-weight: 600; }
.contact-action { padding: 6rpx 20rpx; background-color: rgba(0,83,205,0.1); border-radius: var(--radius-full); }
.contact-action-text { font-size: var(--font-label-sm); color: var(--color-primary); font-weight: 500; }
.contact-footer { padding-top: var(--space-md); border-top: 1px solid var(--color-outline-variant); text-align: center; }
.contact-footer-text { font-size: var(--font-caption); color: var(--color-on-surface-variant); display: block; margin-bottom: var(--space-sm); }
.btn-outline-primary { border: 2px solid var(--color-primary); color: var(--color-primary); padding: 20rpx 0; border-radius: var(--radius-md); font-size: var(--font-h2); font-weight: 600; }
.btn-outline-primary:active { background-color: rgba(0,83,205,0.05); }
</style>
