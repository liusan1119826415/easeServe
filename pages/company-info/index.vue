<template>
  <view class="page-container">
    <!-- 头图 Banner -->
    <view class="hero-banner">
      <image
        class="hero-img"
        src="/static/unnamed.png"
        mode="aspectFill"
      />
      <view class="hero-overlay">
        <text class="hero-title">{{ info.slogan }}</text>
        <text class="hero-subtitle">{{ info.subSlogan }}</text>
      </view>
    </view>

    <!-- 企业概况 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-bar"></view>
        <text class="section-title">企业概况</text>
      </view>
      <text class="section-text">{{ info.description }}</text>
      <view class="feature-list">
        <view class="feature-item" v-for="(f, i) in info.highlights" :key="i">
          <text class="feature-icon">{{ featureIcons[f.icon] || '⭐' }}</text>
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
            <text class="contact-value">{{ info.contact.hotline }}</text>
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
            <text class="contact-value">{{ info.contact.wechat }}</text>
          </view>
        </view>
        <view class="contact-action">
          <text class="contact-action-text">复制</text>
        </view>
      </view>
      <view class="contact-footer">
        <text class="contact-footer-text">若您需要深度定制或复杂政策咨询，可在线咨询人工客服</text>
        <view class="btn-outline-primary" @tap="goHumanChat">
          <text>在线咨询人工客服</text>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <BottomNav :active="2" />
  </view>
</template>

<script>
import { getAbout } from '@/api/index.js'
import BottomNav from '@/components/BottomNav.vue'

export default {
  components: { BottomNav },
  data() {
    return {
      info: {
        slogan: '智慧服务，链接未来',
        subSlogan: '为您提供全方位的政务与企业服务保障',
        description: '',
        highlights: [],
        contact: { hotline: '', wechat: '' }
      },
      featureIcons: {
        verified_user: '🛡️',
        query_stats: '📊',
        groups: '👥'
      }
    }
  },
  onLoad() {
    uni.setNavigationBarTitle({ title: '企业信息' })
    this.loadAbout()
  },
  methods: {
    async loadAbout() {
      try {
        const data = await getAbout()
        if (data) {
          this.info = {
            slogan: data.slogan || this.info.slogan,
            subSlogan: data.subSlogan || this.info.subSlogan,
            description: data.description || '',
            highlights: data.highlights || [],
            contact: data.contact || { hotline: '', wechat: '' }
          }
        }
      } catch (e) {
        console.error('加载企业信息失败:', e)
      }
    },
    callPhone() {
      const phone = this.info.contact.hotline
      if (phone) {
        uni.makePhoneCall({ phoneNumber: phone.replace(/[^0-9\-]/g, '') })
      }
    },
    copyWechat() {
      const wechat = this.info.contact.wechat
      if (wechat) {
        uni.setClipboardData({ data: wechat, success: () => uni.showToast({ title: '已复制微信号', icon: 'success' }) })
      }
    },
    goHumanChat() {
      uni.navigateTo({ url: '/pages/select-support/index' })
    },
  }
}
</script>

<style scoped>
.page-container {
  background-color: #f9f9ff;
  min-height: 100vh;
  padding: 24rpx 32rpx 130rpx;
}

/* 头图 */
.hero-banner {
  position: relative;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 360rpx;
}
.hero-img {
  width: 100%;
  height: 100%;
  opacity: 0.8;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32rpx;
}
.hero-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4rpx;
}
.hero-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 卡片 */
.section-card {
  background-color: #ffffff;
  padding: 32rpx;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.section-bar {
  width: 6rpx;
  height: 36rpx;
  background-color: #0053cd;
  border-radius: 3rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #181c23;
}

/* 概况 */
.section-text {
  font-size: 28rpx;
  color: #424655;
  line-height: 1.7;
  display: block;
  margin-bottom: 24rpx;
}
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}
.feature-icon {
  font-size: 36rpx;
  margin-top: 2rpx;
}
.feature-text {
  font-size: 28rpx;
  color: #424655;
  flex: 1;
}

/* 联系 */
.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background-color: #f9f9ff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}
.contact-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.contact-icon {
  font-size: 36rpx;
}
.contact-info {
  display: flex;
  flex-direction: column;
}
.contact-label {
  font-size: 22rpx;
  color: #5c5f60;
  line-height: 1.4;
}
.contact-value {
  font-size: 30rpx;
  color: #181c23;
  font-weight: 600;
}
.contact-action {
  padding: 8rpx 24rpx;
  background-color: rgba(0, 83, 205, 0.1);
  border-radius: 40rpx;
}
.contact-action-text {
  font-size: 24rpx;
  color: #0053cd;
  font-weight: 500;
}
.contact-footer {
  padding-top: 24rpx;
  border-top: 1px solid #c2c6d8;
  text-align: center;
}
.contact-footer-text {
  font-size: 22rpx;
  color: #424655;
  display: block;
  margin-bottom: 16rpx;
}
.btn-outline-primary {
  border: 2px solid #0053cd;
  color: #0053cd;
  padding: 22rpx 0;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
}
.btn-outline-primary:active {
  background-color: rgba(0, 83, 205, 0.05);
}
</style>
