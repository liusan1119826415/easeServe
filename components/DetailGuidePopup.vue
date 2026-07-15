<template>
  <view v-if="visible" class="guide-overlay" @tap="close">
    <view class="guide-popup" @tap.stop="">
      <view class="guide-popup-header">
        <text class="guide-popup-title">{{ title }}</text>
        <text class="guide-popup-close" @tap="close">✕</text>
      </view>
      <scroll-view class="guide-popup-body" scroll-y>
        <rich-text v-if="content" :nodes="content" class="guide-rich-content" />
        <text v-else class="guide-empty">暂无指引内容</text>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '💡 操作指引' },
    content: { type: String, default: '' }
  },
  emits: ['close'],
  methods: {
    close() { this.$emit('close') }
  }
}
</script>

<style scoped>
.guide-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  padding: 48rpx;
}
.guide-popup {
  width: 100%; max-height: 75vh;
  background: #fff; border-radius: 24rpx;
  overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.guide-popup-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28rpx 32rpx; border-bottom: 1px solid #e3e2e2;
}
.guide-popup-title { font-size: 32rpx; font-weight: 600; color: #1b1c1c; }
.guide-popup-close { font-size: 36rpx; color: #909399; padding: 8rpx; line-height: 1; }
.guide-popup-body { flex: 1; padding: 24rpx 32rpx; max-height: 55vh; }
.guide-rich-content { font-size: 28rpx; color: #1b1c1c; line-height: 1.8; }
.guide-empty { font-size: 26rpx; color: #909399; text-align: center; padding: 40rpx 0; display: block; }
</style>
