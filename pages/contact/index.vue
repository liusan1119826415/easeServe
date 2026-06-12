<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">联系客服</text>
      <view class="nav-right"></view>
    </view>

    <!-- 主内容 -->
    <view class="main">
      <!-- Hero -->
      <view class="hero-card">
        <view class="hero-content">
          <text class="hero-title">您好，需要什么帮助？</text>
          <text class="hero-desc">我们将竭诚为您提供专业的服务支持</text>
        </view>
        <text class="hero-icon">🎧</text>
      </view>

      <!-- 联系方式网格 -->
      <view class="contact-grid">
        <view class="contact-card" @tap="goChat">
          <view class="card-icon-wrap blue">
            <text class="card-icon">💬</text>
          </view>
          <view class="card-info">
            <text class="card-title">在线客服</text>
            <text class="card-desc">即时响应，专业解答</text>
          </view>
          <view class="card-btn primary-btn">
            <text class="card-btn-text">立即咨询</text>
          </view>
        </view>
        <view class="contact-card" @tap="callPhone">
          <view class="card-icon-wrap orange">
            <text class="card-icon">📞</text>
          </view>
          <view class="card-info">
            <text class="card-title">服务热线</text>
            <text class="card-desc">0731-XXXXXXX</text>
          </view>
          <view class="card-btn secondary-btn">
            <text class="card-btn-text-secondary">拨打电话</text>
          </view>
        </view>
      </view>

      <!-- 官方微信 -->
      <view class="wechat-card" @tap="copyWechat">
        <view class="wechat-left">
          <view class="wechat-qr">
            <text class="wechat-qr-icon">📱</text>
          </view>
          <view class="wechat-info">
            <text class="wechat-title">官方微信</text>
            <text class="wechat-desc">关注公众号 获取更多支持</text>
          </view>
        </view>
        <text class="wechat-arrow">›</text>
      </view>

      <!-- 常见问题 -->
      <view class="faq-section">
        <view class="faq-header">
          <text class="faq-title">常见问题</text>
          <text class="faq-more">更多</text>
        </view>
        <view class="faq-list">
          <view class="faq-item" v-for="(item, idx) in faqList" :key="idx" @tap="onFaqTap(item)">
            <view class="faq-item-left">
              <text class="faq-item-icon">{{ item.icon }}</text>
              <text class="faq-item-text">{{ item.text }}</text>
            </view>
            <text class="faq-item-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 服务时间 -->
      <view class="service-hours">
        <text class="service-hours-text">人工服务时间：周一至周日 09:00 - 21:00</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      faqList: [
        { icon: '👤', text: '账号与安全' },
        { icon: '💰', text: '订单及支付问题' },
        { icon: '⚙️', text: '产品功能使用' },
        { icon: '📝', text: '投诉与建议' }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goChat() {
      uni.switchTab({ url: '/pages/qa/index' })
    },
    callPhone() {
      uni.makePhoneCall({ phoneNumber: '0731-XXXXXXX' })
    },
    copyWechat() {
      uni.setClipboardData({
        data: 'EaseServe_Official',
        success: () => {
          uni.showToast({ title: '微信号已复制', icon: 'success' })
        }
      })
    },
    onFaqTap(item) {
      uni.showToast({ title: item.text, icon: 'none' })
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
.nav-icon { font-size: 20px; color: var(--color-primary); }
.nav-title { font-size: 18px; font-weight: 600; color: var(--color-primary); }
.nav-right { width: 24px; }
.main { padding: 72px 16px 32px; }

.hero-card {
  position: relative; overflow: hidden; border-radius: 12px;
  padding: 16px; min-height: 120px; display: flex; align-items: center;
  background: var(--color-primary-container); margin-bottom: 24px;
}
.hero-content { position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 600; color: #fff; display: block; margin-bottom: 8px; }
.hero-desc { font-size: 14px; color: rgba(255,255,255,0.9); }
.hero-icon {
  position: absolute; right: -10px; bottom: -20px; font-size: 100px; opacity: 0.15;
}

.contact-grid { display: flex; gap: 12px; margin-bottom: 24px; }
.contact-card {
  flex: 1; background: #fff; border-radius: 12px; padding: 16px;
  border: 1px solid var(--color-outline-variant);
  display: flex; flex-direction: column; justify-content: space-between; min-height: 160px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.card-icon-wrap {
  width: 40px; height: 40px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
.card-icon-wrap.blue { background: rgba(20,107,251,0.1); }
.card-icon-wrap.orange { background: rgba(202,75,0,0.1); }
.card-icon { font-size: 20px; }
.card-info { margin: 12px 0; }
.card-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); display: block; margin-bottom: 4px; }
.card-desc { font-size: 11px; color: var(--color-secondary); }

.card-btn {
  width: 100%; padding: 8px 0; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.primary-btn { background: var(--color-primary); }
.card-btn-text { color: #fff; font-size: 12px; font-weight: 500; }
.secondary-btn { background: var(--color-surface-container-low); }
.card-btn-text-secondary { color: var(--color-on-surface-variant); font-size: 12px; font-weight: 500; }

.wechat-card {
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border-radius: 12px; padding: 16px;
  border: 1px solid var(--color-outline-variant); margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.wechat-left { display: flex; align-items: center; gap: 16px; }
.wechat-qr {
  width: 48px; height: 48px; border-radius: 8px; overflow: hidden;
  background: var(--color-surface-container); display: flex; align-items: center; justify-content: center;
}
.wechat-qr-icon { font-size: 28px; }
.wechat-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); display: block; }
.wechat-desc { font-size: 14px; color: var(--color-secondary); }
.wechat-arrow { font-size: 20px; color: var(--color-outline-variant); }

.faq-section { margin-bottom: 24px; }
.faq-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.faq-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); }
.faq-more { font-size: 12px; color: var(--color-primary); font-weight: 500; }
.faq-list { display: flex; flex-direction: column; gap: 8px; }
.faq-item {
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border-radius: 8px; padding: 16px;
  border: 1px solid var(--color-outline-variant);
}
.faq-item-left { display: flex; align-items: center; gap: 12px; }
.faq-item-icon { font-size: 20px; }
.faq-item-text { font-size: 14px; color: var(--color-on-surface); }
.faq-item-arrow { font-size: 16px; color: var(--color-outline-variant); }

.service-hours { text-align: center; padding-bottom: 40px; }
.service-hours-text { font-size: 11px; color: var(--color-secondary); }
</style>
