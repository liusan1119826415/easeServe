<template>
  <view class="page-container">
    <!-- 流程图预览区 -->
    <view class="preview-section">
      <view class="dot-bg"></view>
      <view class="flow-card">
        <view class="flow-placeholder">
          <text class="flow-icon">🌳</text>
          <text class="flow-title">流程图示例</text>
          <text class="flow-subtitle">包含 12 个核心节点与决策路径</text>
        </view>
      </view>
      <view class="preview-tags">
        <view class="tag tag-primary"><text>高清矢量</text></view>
        <view class="tag tag-tertiary"><text>合规指导</text></view>
      </view>
    </view>

    <!-- 底部详情区 -->
    <view class="detail-section">
      <text class="detail-h1">标准化招聘体系全景图</text>
      <text class="detail-desc">本流程图涵盖了从需求确认、渠道筛选到终面入职的全闭环路径，旨在帮助企业建立高效、合规的招聘管理体系。</text>

      <!-- 模糊内容 -->
      <view class="blurred-content">
        <view class="content-item">
          <view class="content-icon-wrap"><text class="content-icon">📄</text></view>
          <view class="content-text">
            <text class="content-h2">关键步骤解析</text>
            <text class="content-body blurred">流程的首要阶段涉及岗位需求调研与画像刻画，通过科学的岗位分析工具确立核心胜任力模型，从而在海量渠道中精准定位人才。第二阶段则侧重于三级面试筛选机制的建立，确保专业水平与文化价值观的双重契合。</text>
          </view>
        </view>
        <view class="content-item">
          <view class="content-icon-wrap"><text class="content-icon">🔨</text></view>
          <view class="content-text">
            <text class="content-h2">合规性风险提示</text>
            <text class="content-body blurred">在发放Offer及背调环节，流程图详细标注了法律合规节点，包括信息采集的合法性边界以及候选人隐私保护措施。特别是在劳动合同签署前的试用期考核标准，需与岗位说明书保持高度一致。</text>
          </view>
        </view>
        <view class="fade-overlay"></view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <view class="btn-primary-full" @tap="handlePay">
          <text>💰 付费查看完整流程 ¥9.9</text>
        </view>
        <view class="btn-outline-full" @tap="goContact">
          <text>🎧 联系人工咨询（按次收费）</text>
        </view>
      </view>

      <!-- 信任指标 -->
      <view class="trust-bar">
        <view class="trust-item">
          <text class="trust-value primary-text">4.9</text>
          <text class="trust-label">用户好评度</text>
        </view>
        <view class="trust-item">
          <text class="trust-value">1,280+</text>
          <text class="trust-label">已订阅企业</text>
        </view>
        <view class="trust-item trust-last">
          <text class="trust-value">V2.4</text>
          <text class="trust-label">更新版本</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    handlePay() {
      uni.showToast({ title: '支付功能开发中', icon: 'none' })
    },
    goContact() {
      uni.navigateTo({ url: '/pages/select-support/index' })
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-background);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.preview-section {
  flex: 1;
  min-height: 400rpx;
  background-color: var(--color-surface-container-high);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}
.dot-bg {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image: radial-gradient(circle at 2px 2px, var(--color-outline) 1px, transparent 0);
  background-size: 24px 24px;
}
.flow-card {
  width: 100%;
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-outline-variant);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  z-index: 10;
}
.flow-placeholder {
  border: 2px dashed var(--color-outline-variant);
  border-radius: var(--radius-md);
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  background-color: rgba(249,249,255,0.5);
}
.flow-icon { font-size: 64rpx; }
.flow-title { font-size: var(--font-h2); font-weight: 600; color: var(--color-outline); }
.flow-subtitle { font-size: var(--font-caption); color: var(--color-secondary); }
.preview-tags {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  z-index: 10;
}
.tag {
  padding: 6rpx 20rpx;
  border-radius: var(--radius-full);
  font-size: var(--font-label-sm);
}
.tag-primary { background-color: rgba(0,83,205,0.1); color: var(--color-primary); }
.tag-tertiary { background-color: rgba(161,59,0,0.1); color: var(--color-tertiary); }
.detail-section {
  background-color: var(--color-surface-container-lowest);
  padding: var(--space-md);
  border-radius: 48rpx 48rpx 0 0;
  margin-top: -32rpx;
  box-shadow: 0 -8px 24px rgba(0,0,0,0.03);
  z-index: 20;
}
.detail-h1 {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 8rpx;
  display: block;
}
.detail-desc {
  font-size: var(--font-body-md);
  color: var(--color-secondary);
  margin-bottom: var(--space-lg);
  display: block;
  line-height: 1.6;
}
.blurred-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.content-item {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}
.content-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: var(--color-secondary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.content-icon { font-size: 32rpx; }
.content-h2 {
  font-size: var(--font-h2);
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 4rpx;
  display: block;
}
.content-body {
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
  line-height: 1.6;
}
.fade-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 200rpx;
  background: linear-gradient(to top, var(--color-surface-container-lowest), transparent);
}
.action-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-md);
}
.btn-primary-full {
  height: 100rpx;
  background-color: var(--color-primary-container);
  color: var(--color-on-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-h2);
  font-weight: 600;
  box-shadow: var(--shadow-md);
}
.btn-primary-full:active { transform: scale(0.98); }
.btn-outline-full {
  height: 100rpx;
  border: 1px solid var(--color-outline);
  color: var(--color-on-surface);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-h2);
  font-weight: 600;
}
.btn-outline-full:active { background-color: var(--color-surface-variant); }
.trust-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-outline-variant);
  margin-top: var(--space-md);
}
.trust-item {
  flex: 1;
  text-align: center;
  border-right: 1px solid var(--color-outline-variant);
  padding: 0 8rpx;
}
.trust-last { border-right: none; }
.trust-value {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
}
.primary-text { color: var(--color-primary); }
.trust-label {
  font-size: var(--font-caption);
  color: var(--color-secondary);
}
</style>
