<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">服务体系</text>
      <view class="nav-right"></view>
    </view>

    <!-- 主内容 -->
    <view class="main">
      <view class="section-header">
        <text class="section-title">选择专项客服</text>
        <text class="section-desc">为了为您提供更专业的服务，请选择您需要咨询的业务领域。</text>
      </view>

      <!-- 分类网格 -->
      <view class="category-list">
        <view class="category-card" v-for="(item, idx) in categories" :key="idx" @tap="selectCategory(item)">
          <view class="cat-icon-wrap" :style="{ background: item.bgColor }">
            <text class="cat-icon">{{ item.icon }}</text>
          </view>
          <view class="cat-info">
            <text class="cat-name">{{ item.name }}</text>
            <text class="cat-desc">{{ item.desc }}</text>
          </view>
          <view class="cat-action">
            <text class="cat-action-text" :style="{ color: item.accentColor }">立即接入 →</text>
          </view>
        </view>
      </view>

      <!-- 底部横幅 -->
      <view class="support-banner">
        <view class="banner-bg">
          <view class="banner-content">
            <text class="banner-label">EXPERT SUPPORT</text>
            <text class="banner-main">专业团队 实时在线</text>
            <text class="banner-sub">您的每一个问题，都有资深专家为您详细解答。</text>
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
      categories: [
        { name: '工商服务', desc: '企业注册、变更、注销及年报等相关业务咨询。', icon: '💼', bgColor: 'rgba(0,95,184,0.1)', accentColor: '#005FB8' },
        { name: '税务服务', desc: '税务申报、发票申领、税收优惠政策解读及筹划。', icon: '💰', bgColor: 'rgba(86,95,113,0.1)', accentColor: '#565F71' },
        { name: '劳动关系', desc: '入职合同、社保公积金、劳资纠纷及离职补偿咨询。', icon: '👥', bgColor: 'rgba(68,71,79,0.1)', accentColor: '#44474E' },
        { name: '法律事务', desc: '合同审核、知识产权保护、企业合规及法律风险把控。', icon: '⚖️', bgColor: 'rgba(0,95,184,0.1)', accentColor: '#005FB8' }
      ]
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    selectCategory(item) {
      uni.showToast({ title: '正在连接 ' + item.name + ' 客服...', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/support-chat/index' })
      }, 1000)
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-surface); }
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: var(--color-surface-container-lowest);
  border-bottom: 1px solid var(--color-outline-variant);
}
.nav-icon { font-size: 20px; color: var(--color-primary); }
.nav-title { font-size: 18px; font-weight: 600; color: var(--color-primary); }
.nav-right { width: 24px; }
.main { padding: 72px 16px 32px; max-width: 800px; margin: 0 auto; }

.section-header { margin-bottom: 32px; }
.section-title { font-size: 28px; font-weight: 800; color: var(--color-on-surface); display: block; margin-bottom: 8px; }
.section-desc { font-size: 14px; color: var(--color-on-surface-variant); }

.category-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 48px; }
.category-card {
  background: rgba(255,255,255,0.8); border-radius: 12px; padding: 24px;
  display: flex; flex-direction: column; border-left: 4px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.cat-icon-wrap { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.cat-icon { font-size: 24px; }
.cat-info { margin-bottom: 16px; }
.cat-name { font-size: 20px; font-weight: 700; color: var(--color-on-surface); display: block; margin-bottom: 4px; }
.cat-desc { font-size: 14px; color: var(--color-on-surface-variant); }
.cat-action-text { font-size: 14px; font-weight: 600; }

.support-banner { border-radius: 16px; overflow: hidden; height: 192px; }
.banner-bg { width: 100%; height: 100%; background: linear-gradient(135deg, rgba(0,95,184,0.85), rgba(0,95,184,0.4)); display: flex; align-items: center; padding: 32px; }
.banner-content { display: flex; flex-direction: column; }
.banner-label { font-size: 11px; color: rgba(255,255,255,0.8); letter-spacing: 2px; margin-bottom: 4px; font-weight: 500; }
.banner-main { font-size: 24px; font-weight: 700; color: #fff; }
.banner-sub { font-size: 12px; color: rgba(255,255,255,0.9); margin-top: 8px; max-width: 200px; }
</style>
