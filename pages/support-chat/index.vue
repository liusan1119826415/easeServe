<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">专项人工客服</text>
      <view class="nav-right">
        <text class="nav-action" @tap="callSupport">📞</text>
        <text class="nav-action">⋮</text>
      </view>
    </view>

    <!-- 聊天区 -->
    <scroll-view class="chat-area" scroll-y :scroll-top="scrollTop" scroll-with-animation>
      <!-- 系统提示 -->
      <view class="system-msg">
        <text class="system-text">专项法律顾问已接入，为您提供专业支持</text>
      </view>

      <!-- AI 问候 -->
      <view class="msg-row ai-row">
        <view class="ai-avatar">
          <text class="avatar-emoji">🎧</text>
        </view>
        <view class="chat-bubble ai-bubble">
          <text class="bubble-text">您好！我是您的专项服务专员。针对您提到的法律文书处理，您可以点击下方"文字识别"快速上传保单、合同或仲裁文书。我会为您进行深度解析。</text>
        </view>
      </view>

      <!-- OCR 快捷操作 -->
      <view class="ocr-section">
        <view class="ocr-header">
          <text class="ocr-label">📄 文字识别加速</text>
        </view>
        <view class="ocr-grid">
          <view class="ocr-item" v-for="(item, idx) in ocrItems" :key="idx" @tap="onOcrTap(item)">
            <view class="ocr-icon-wrap">
              <text class="ocr-icon">{{ item.icon }}</text>
            </view>
            <text class="ocr-name">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- 用户消息 -->
      <view class="msg-row user-row">
        <view class="user-bubble-wrap">
          <view class="chat-bubble user-bubble">
            <view class="doc-preview">
              <view class="doc-bg">
                <text class="doc-icon">📋</text>
              </view>
              <view class="doc-overlay">
                <text class="doc-overlay-icon">⏳</text>
              </view>
            </view>
            <view class="doc-info">
              <text class="doc-info-icon">📤</text>
              <text class="doc-info-text">已上传：保险理赔合同样本.pdf</text>
            </view>
          </view>
          <view class="ocr-status">
            <view class="status-dot-pulse"></view>
            <text class="ocr-status-text">文字识别中...</text>
          </view>
        </view>
        <view class="user-avatar">
          <text class="user-avatar-text">我</text>
        </view>
      </view>

      <!-- AI 识别结果 -->
      <view class="msg-row ai-row">
        <view class="ai-avatar">
          <text class="avatar-emoji">🎧</text>
        </view>
        <view class="chat-bubble ai-bubble">
          <view class="result-header">
            <text class="result-icon">✅</text>
            <text class="result-label">文字提取完成</text>
          </view>
          <view class="result-quote">
            <text class="quote-text">"第四条：关于不可抗力因素导致的违约责任..."</text>
          </view>
          <text class="result-desc">已成功识别文书核心条款。检测到这是一份仲裁裁决书。是否需要我对赔偿金额计算逻辑进行深度复核？</text>
          <view class="result-actions">
            <view class="result-tag" @tap="onTagTap('核心条款摘要')">
              <text class="tag-text">核心条款摘要</text>
            </view>
            <view class="result-tag" @tap="onTagTap('法律效力核查')">
              <text class="tag-text">法律效力核查</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 160px;"></view>
    </scroll-view>

    <!-- 底部输入区 -->
    <view class="bottom-area">
      <view class="ocr-bar">
        <view class="ocr-bar-scroll">
          <view class="ocr-chip primary-chip" @tap="onOcrTap({ name: '文字识别' })">
            <text class="chip-text-primary">🧠 文字识别</text>
          </view>
          <view class="ocr-chip" @tap="onOcrTap({ name: '保单' })">
            <text class="chip-text">保单</text>
          </view>
          <view class="ocr-chip" @tap="onOcrTap({ name: '更多' })">
            <text class="chip-text">⋯ 更多</text>
          </view>
        </view>
        <text class="help-icon">❓</text>
      </view>
      <view class="input-bar">
        <view class="input-wrap">
          <text class="input-action">⊕</text>
          <input class="chat-input" v-model="inputText" placeholder="咨询专项客服..." confirm-type="send" @confirm="sendMessage" />
          <text class="input-action">😊</text>
        </view>
        <view class="send-btn" @tap="sendMessage">
          <text class="send-icon">➤</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inputText: '',
      scrollTop: 0,
      ocrItems: [
        { name: '保单', icon: '🛡️' },
        { name: '合同', icon: '📄' },
        { name: '仲裁文书', icon: '⚖️' }
      ]
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    callSupport() {
      uni.makePhoneCall({ phoneNumber: '0731-XXXXXXX' })
    },
    onOcrTap(item) {
      uni.showToast({ title: '选择 ' + item.name, icon: 'none' })
    },
    onTagTap(tag) {
      uni.showToast({ title: tag, icon: 'none' })
    },
    sendMessage() {
      if (!this.inputText.trim()) return
      uni.showToast({ title: '消息已发送', icon: 'success' })
      this.inputText = ''
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f2f3f5; }
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: #fff;
  border-bottom: 1px solid var(--color-outline-variant);
}
.nav-left { display: flex; align-items: center; gap: 12px; }
.nav-icon { font-size: 20px; color: var(--color-primary); }
.nav-title { font-size: 18px; font-weight: 700; color: var(--color-on-surface); }
.nav-right { display: flex; align-items: center; gap: 16px; }
.nav-action { font-size: 18px; }

.chat-area { height: 100vh; padding: 72px 16px 0; }

.system-msg { text-align: center; margin-bottom: 16px; }
.system-text { font-size: 12px; color: rgba(68,71,79,0.6); background: rgba(225,226,236,0.3); padding: 4px 12px; border-radius: 12px; }

.msg-row { display: flex; gap: 12px; margin-bottom: 24px; }
.ai-row { align-items: flex-start; }
.user-row { justify-content: flex-end; }
.ai-avatar { width: 40px; height: 40px; border-radius: 20px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-emoji { font-size: 20px; }
.user-avatar { width: 40px; height: 40px; border-radius: 20px; background: var(--color-surface-variant); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-avatar-text { font-size: 14px; color: var(--color-on-surface-variant); font-weight: 600; }

.chat-bubble { padding: 16px; max-width: 85%; }
.ai-bubble { background: #fff; border-radius: 20px 20px 20px 4px; border: 1px solid rgba(196,198,208,0.3); box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
.user-bubble { background: var(--color-primary); border-radius: 20px 20px 4px 20px; }
.bubble-text { font-size: 14px; line-height: 1.6; color: var(--color-on-surface); }

.ocr-section { margin-bottom: 24px; padding: 0 52px; }
.ocr-header { margin-bottom: 8px; }
.ocr-label { font-size: 12px; font-weight: 600; color: var(--color-secondary); letter-spacing: 1px; }
.ocr-grid { display: flex; gap: 8px; }
.ocr-item {
  flex: 1; background: #fff; border: 1px solid var(--color-outline-variant);
  border-radius: 12px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.ocr-icon-wrap { width: 40px; height: 40px; border-radius: 20px; background: rgba(0,82,217,0.08); display: flex; align-items: center; justify-content: center; }
.ocr-icon { font-size: 20px; }
.ocr-name { font-size: 12px; font-weight: 500; color: var(--color-on-surface); }

.user-bubble-wrap { max-width: 85%; display: flex; flex-direction: column; align-items: flex-end; }
.doc-preview { position: relative; border-radius: 8px; overflow: hidden; height: 120px; margin-bottom: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
.doc-bg { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.doc-icon { font-size: 40px; opacity: 0.7; }
.doc-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); }
.doc-overlay-icon { font-size: 28px; }
.doc-info { display: flex; align-items: center; gap: 8px; }
.doc-info-icon { font-size: 16px; }
.doc-info-text { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.9); }

.ocr-status { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.status-dot-pulse { width: 8px; height: 8px; border-radius: 4px; background: var(--color-primary); }
.ocr-status-text { font-size: 12px; color: var(--color-primary); font-weight: 600; }

.result-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.result-icon { font-size: 18px; }
.result-label { font-size: 12px; font-weight: 700; color: var(--color-primary); letter-spacing: 0.5px; }
.result-quote { background: var(--color-surface); padding: 8px; border-radius: 4px; border-left: 4px solid rgba(0,82,217,0.4); margin-bottom: 8px; }
.quote-text { font-size: 14px; color: var(--color-on-surface-variant); font-style: italic; }
.result-desc { font-size: 14px; line-height: 1.6; color: var(--color-on-surface); margin-bottom: 16px; }
.result-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.result-tag { padding: 6px 12px; border-radius: 16px; border: 1px solid var(--color-primary); }
.tag-text { font-size: 12px; color: var(--color-primary); font-weight: 500; }

.bottom-area { position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: rgba(255,255,255,0.85); border-top: 1px solid rgba(196,198,208,0.5); padding-bottom: env(safe-area-inset-bottom); }
.ocr-bar { display: flex; align-items: center; gap: 12px; padding: 8px 16px; background: rgba(0,82,217,0.05); }
.ocr-bar-scroll { flex: 1; display: flex; gap: 8px; overflow-x: auto; }
.ocr-chip { padding: 4px 12px; border-radius: 16px; background: #fff; border: 1px solid rgba(196,198,208,0.3); }
.primary-chip { background: var(--color-primary); border: none; }
.chip-text-primary { color: #fff; font-size: 12px; font-weight: 700; }
.chip-text { font-size: 12px; color: var(--color-on-surface-variant); }
.help-icon { font-size: 18px; }

.input-bar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; }
.input-wrap { flex: 1; background: #f0f2f5; border-radius: 12px; padding: 8px 12px; display: flex; align-items: center; gap: 8px; }
.input-action { font-size: 20px; color: var(--color-on-surface-variant); }
.chat-input { background: transparent; border: none; font-size: 14px; flex: 1; }
.send-btn { width: 40px; height: 40px; border-radius: 20px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; }
.send-icon { color: #fff; font-size: 18px; }
</style>
