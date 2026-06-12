<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">会员方案</text>
      <view class="nav-right"></view>
    </view>

    <!-- Hero 区域 -->
    <view class="hero">
      <view class="hero-bg">
        <text class="hero-deco">🏛️</text>
      </view>
      <view class="hero-overlay">
        <text class="hero-title">专业服务体系</text>
        <text class="hero-desc">多维度深度风险防控，助力企业高效合规</text>
      </view>
    </view>

    <!-- 层级选择 -->
    <view class="tier-section">
      <scroll-view class="tier-scroll" scroll-x>
        <view class="tier-card" v-for="(tier, idx) in tiers" :key="idx"
          :class="{ active: selectedTier === idx }" @tap="selectTier(idx)">
          <view class="tier-header">
            <view class="tier-badges">
              <text class="tier-badge" :class="tier.badgeClass">{{ tier.level }}</text>
              <text v-if="tier.recommend" class="tier-recommend">主推推荐款</text>
            </view>
            <text class="tier-check" :class="{ checked: selectedTier === idx }">
              {{ selectedTier === idx ? '●' : '○' }}
            </text>
          </view>
          <text class="tier-name">{{ tier.name }}</text>
          <text class="tier-sub">{{ tier.subtitle }}</text>
          <view class="tier-price-row">
            <text class="tier-price">¥{{ tier.price }}</text>
            <text class="tier-unit">/年</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 权益对比 -->
    <view class="features-section">
      <view class="features-card">
        <view class="features-header">
          <text class="features-header-text">增值服务权益</text>
        </view>
        <view class="feature-list">
          <view class="feature-row" v-for="(feat, idx) in features" :key="idx"
            :class="{ dimmed: feat.dimmed }">
            <text class="feature-icon">{{ feat.icon }}</text>
            <view class="feature-info">
              <text class="feature-name">{{ feat.name }}</text>
            </view>
            <text class="feature-value" :class="{ 'feature-check': feat.isCheck }">
              {{ feat.value }}
            </text>
          </view>
        </view>
      </view>
      <view class="legend-row">
        <view class="legend-dot"></view>
        <text class="legend-text">所有方案均包含专业合规手册更新提醒</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="price-wrap">
        <text class="price-label">应付总计</text>
        <view class="price-row">
          <text class="price-value">¥{{ tiers[selectedTier].price }}</text>
          <text class="price-suffix">起</text>
        </view>
      </view>
      <view class="buy-btn" @tap="onBuy">
        <text class="buy-text">立即选购</text>
        <text class="buy-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedTier: 0,
      tiers: [
        { level: 'L1 层级', name: '启航版', subtitle: '日常合规无忧', price: 280, badgeClass: 'badge-light', recommend: false },
        { level: 'L2 层级', name: '巡航版', subtitle: '深度风险防控', price: 680, badgeClass: 'badge-primary', recommend: true },
        { level: 'L3 层级', name: '远航版', subtitle: '专业顾问支持', price: 1280, badgeClass: 'badge-dark', recommend: false }
      ],
      featureData: {
        0: { consulting: '10次/年', risk: '1次/年', analysis: '/', visit: '/' },
        1: { consulting: '20次/年', risk: '5次/年', analysis: '2次/年', visit: '1次' },
        2: { consulting: '40次/年', risk: '10次/年', analysis: '5次/年', visit: '2次' }
      }
    }
  },
  computed: {
    features() {
      const d = this.featureData[this.selectedTier]
      return [
        { icon: '🌳', name: '流程图游览/下载', value: '✓', isCheck: true, dimmed: false },
        { icon: '🤖', name: 'AI 智能问答', value: '✓', isCheck: true, dimmed: false },
        { icon: '💬', name: '线上咨询 (20分钟/次)', value: d.consulting, isCheck: false, dimmed: false },
        { icon: '📊', name: '模块风险测评报告', value: d.risk, isCheck: false, dimmed: false },
        { icon: '🧮', name: '模块计算器', value: '✓', isCheck: true, dimmed: false },
        { icon: '📄', name: '客户文件分析报告', value: d.analysis, isCheck: false, dimmed: d.analysis === '/' },
        { icon: '🎧', name: '上门专项咨询', value: d.visit, isCheck: false, dimmed: d.visit === '/' }
      ]
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    selectTier(idx) { this.selectedTier = idx },
    onBuy() {
      uni.showToast({ title: '选购 ' + this.tiers[this.selectedTier].name, icon: 'success' })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #faf9f9; padding-bottom: 120px; }
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 48px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: var(--color-surface);
}
.nav-icon { font-size: 20px; color: var(--color-primary); }
.nav-title { font-size: 20px; font-weight: 600; color: var(--color-on-surface); }
.nav-right { width: 24px; }

.hero { position: relative; height: 192px; overflow: hidden; }
.hero-bg {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  display: flex; align-items: center; justify-content: center;
}
.hero-deco { font-size: 80px; opacity: 0.3; }
.hero-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  justify-content: center; padding: 0 16px;
}
.hero-title { font-size: 24px; font-weight: 600; color: #fff; }
.hero-desc { font-size: 14px; color: rgba(255,255,255,0.9); margin-top: 4px; }

.tier-section { margin-top: -48px; position: relative; z-index: 30; padding: 0 16px; }
.tier-scroll {
  white-space: nowrap; padding-bottom: 16px;
}
.tier-card {
  display: inline-block; vertical-align: top;
  width: 260px; background: #fff; border-radius: 12px;
  padding: 16px; border: 1px solid var(--color-outline-variant);
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  margin-right: 16px; box-sizing: border-box;
  white-space: normal;
}
.tier-card:last-child { margin-right: 0; }
.tier-card.active {
  border: 2px solid var(--color-primary); background: #f4f7ff;
}
.tier-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
}
.tier-badges { display: flex; }
.tier-badge { margin-right: 4px; }
.tier-badges .tier-badge:last-child { margin-right: 0; }
.tier-badge {
  font-size: 12px; font-weight: 500; padding: 4px 8px; border-radius: 4px;
}
.badge-light { background: rgba(0,83,205,0.1); color: var(--color-primary); }
.badge-primary { background: var(--color-primary); color: #fff; }
.badge-dark { background: #2f3031; color: #f2f0f0; }
.tier-recommend {
  font-size: 11px; padding: 4px 8px; border-radius: 4px;
  background: #ca4b00; color: #fff;
}
.tier-check { font-size: 18px; color: var(--color-outline-variant); }
.tier-check.checked { color: var(--color-primary); }
.tier-name {
  font-size: 18px; font-weight: 600; color: var(--color-on-surface);
  display: block; margin-bottom: 4px;
}
.tier-sub {
  font-size: 11px; color: var(--color-secondary);
  display: block; margin-bottom: 16px;
}
.tier-price-row { display: flex; align-items: baseline; gap: 4px; }
.tier-price { font-size: 24px; font-weight: 600; color: var(--color-primary); }
.tier-unit { font-size: 11px; color: var(--color-secondary); }

.features-section { padding: 24px 16px; }
.features-card {
  background: #fff; border-radius: 12px; overflow: hidden;
  border: 1px solid var(--color-outline-variant);
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}
.features-header { background: var(--color-surface-container); padding: 12px 16px; }
.features-header-text { font-size: 12px; font-weight: 500; color: var(--color-secondary); }
.feature-row {
  display: flex; align-items: center; padding: 16px;
  border-bottom: 1px solid rgba(194,198,216,0.3);
}
.feature-row:last-child { border-bottom: none; }
.feature-row.dimmed { opacity: 0.4; }
.feature-icon { font-size: 20px; margin-right: 16px; }
.feature-info { flex: 1; }
.feature-name { font-size: 14px; font-weight: 500; color: var(--color-on-surface); }
.feature-value {
  font-size: 12px; font-weight: 500; color: var(--color-on-surface-variant);
}
.feature-check { color: var(--color-primary); font-weight: 700; font-size: 16px; }

.legend-row { display: flex; align-items: center; gap: 8px; padding: 16px 8px; }
.legend-dot {
  width: 8px; height: 8px; border-radius: 4px; background: var(--color-primary);
}
.legend-text { font-size: 11px; color: var(--color-secondary); }

.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  background: #fff; border-top: 1px solid var(--color-outline-variant);
  padding: 16px; display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
}
.price-label { font-size: 11px; color: var(--color-secondary); }
.price-row { display: flex; align-items: baseline; }
.price-value {
  font-size: 24px; font-weight: 600; color: var(--color-primary); margin-right: 4px;
}
.price-suffix { font-size: 11px; color: var(--color-secondary); }
.buy-btn {
  background: var(--color-primary); padding: 12px 40px; border-radius: 12px;
  display: flex; align-items: center; gap: 8px;
}
.buy-text { color: #fff; font-size: 18px; font-weight: 600; }
.buy-arrow { color: #fff; font-size: 18px; }
</style>
