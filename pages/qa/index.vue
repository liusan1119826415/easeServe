<template>
  <view class="page-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input class="search-input" placeholder="输入关键词，例如 社保缴纳" v-model="searchText" />
      </view>
    </view>

    <!-- FAQ 快捷标签 -->
    <view class="faq-section">
      <view class="faq-bubble" v-for="(q, i) in faqList" :key="i" @tap="sendQuestion(q)">
        <text>{{ q }}</text>
      </view>
    </view>

    <!-- 聊天区域 -->
    <view class="chat-area">
      <!-- 机器人消息 -->
      <view class="msg-row msg-bot">
        <view class="msg-avatar bot-avatar">
          <text>🤖</text>
        </view>
        <view class="msg-meta">
          <text class="meta-label">智能助手 10:24</text>
        </view>
        <view class="msg-bubble bot-bubble">
          <text class="msg-text">您好！我是您的企业服务智能助手。您可以向我咨询关于社保、招聘、行政流程或政策解读等相关问题。</text>
        </view>
      </view>

      <!-- 用户消息 -->
      <view class="msg-row msg-user">
        <view class="msg-meta user-meta">
          <text class="meta-label">您 10:25</text>
        </view>
        <view class="msg-avatar user-avatar">
          <text>👤</text>
        </view>
        <view class="msg-bubble user-bubble">
          <text class="msg-text">我想了解一下最新的工伤认定流程。</text>
        </view>
      </view>

      <!-- 机器人回复 -->
      <view class="msg-row msg-bot">
        <view class="msg-avatar bot-avatar">
          <text>🤖</text>
        </view>
        <view class="msg-meta">
          <text class="meta-label">智能助手 10:25</text>
        </view>
        <view class="msg-bubble bot-bubble">
          <text class="msg-text">根据最新政策，工伤认定流程主要包括以下几个步骤：</text>
          <view class="msg-list">
            <text class="msg-list-item">1. 事故发生后24小时内向人事部报备。</text>
            <text class="msg-list-item">2. 30日内提交《工伤认定申请表》及相关诊断证明。</text>
            <text class="msg-list-item">3. 劳动保障部门受理并进行调查。</text>
            <text class="msg-list-item">4. 60日内下达认定决定。</text>
          </view>
          <view class="msg-link-area">
            <text class="msg-link">📄 查看详细文件清单</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-btn action-primary" @tap="goSmartChat">
        <text>🤖 智能客服 (自动回复)</text>
      </view>
      <view class="action-btn action-outline" @tap="goHumanChat">
        <text>👩‍💼 人工咨询 (按次收费)</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav safe-area-bottom">
      <view class="nav-item" @tap="switchTab(0)">
        <text class="nav-icon">🏠</text>
        <text class="nav-label">首页</text>
      </view>
      <view class="nav-item nav-active" @tap="switchTab(1)">
        <text class="nav-icon">💬</text>
        <text class="nav-label">智能问答</text>
      </view>
      <view class="nav-item" @tap="switchTab(2)">
        <text class="nav-icon">💼</text>
        <text class="nav-label">企业信息</text>
      </view>
      <view class="nav-item" @tap="switchTab(3)">
        <text class="nav-icon">👤</text>
        <text class="nav-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      faqList: ['如何办理工伤认定？', '招聘流程需要哪些文件？', '社保缴纳比例说明', '公积金提取指南']
    }
  },
  methods: {
    sendQuestion(q) {
      this.searchText = q
    },
    goSmartChat() {
      uni.showToast({ title: '智能客服接入中...', icon: 'none' })
    },
    goHumanChat() {
      uni.navigateTo({ url: '/pages/select-support/index' })
    },
    switchTab(index) {
      const tabs = ['/pages/index/index', '/pages/qa/index', '/pages/enterprise/index', '/pages/my/index']
      if (index === 1) return
      uni.navigateTo({ url: tabs[index] })
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-background);
  min-height: 100vh;
  padding-bottom: 220rpx;
}
.search-bar {
  padding: var(--space-md);
}
.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: var(--color-surface-container-low);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-outline-variant);
  padding: 0 24rpx;
  height: 88rpx;
}
.search-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
}
.search-input {
  flex: 1;
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
}
.faq-section {
  padding: 0 var(--space-md);
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}
.faq-bubble {
  padding: 12rpx 24rpx;
  background-color: var(--color-surface-container-highest);
  border-radius: var(--radius-full);
  font-size: var(--font-label-sm);
  color: var(--color-on-surface-variant);
}
.faq-bubble:active {
  background-color: rgba(20,107,251,0.2);
}
.chat-area {
  padding: var(--space-lg) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.msg-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  max-width: 85%;
}
.msg-user {
  align-self: flex-end;
  align-items: flex-end;
}
.msg-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}
.bot-avatar {
  background-color: var(--color-primary-container);
}
.user-avatar {
  background-color: var(--color-secondary-container);
}
.msg-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.user-meta {
  align-self: flex-end;
}
.meta-label {
  font-size: var(--font-caption);
  color: var(--color-secondary);
}
.msg-bubble {
  padding: 24rpx;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-outline-variant);
  box-shadow: var(--shadow-sm);
}
.bot-bubble {
  background-color: var(--color-surface-container-low);
  border-top-left-radius: 0;
}
.user-bubble {
  background-color: var(--color-primary);
  border-top-right-radius: 0;
}
.user-bubble .msg-text {
  color: var(--color-on-primary);
}
.msg-text {
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
  line-height: 1.6;
}
.msg-list {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.msg-list-item {
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
  line-height: 1.5;
}
.msg-link-area {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid var(--color-outline-variant);
}
.msg-link {
  font-size: var(--font-label-sm);
  color: var(--color-primary);
}
.action-bar {
  position: fixed;
  bottom: 110rpx;
  left: 0;
  right: 0;
  background-color: var(--color-surface-container-lowest);
  border-top: 1px solid var(--color-outline-variant);
  padding: 20rpx var(--space-md);
  z-index: 40;
  display: flex;
  gap: 16rpx;
}
.action-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-label-sm);
  font-weight: 500;
}
.action-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-md);
}
.action-outline {
  border: 1px solid var(--color-outline);
  color: var(--color-on-surface);
}
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: var(--color-surface-container-lowest);
  border-top: 1px solid var(--color-outline-variant);
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 110rpx;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.nav-icon { font-size: 44rpx; margin-bottom: 2rpx; }
.nav-label { font-size: var(--font-label-sm); color: var(--color-secondary); }
.nav-active .nav-label { color: var(--color-primary); font-weight: 600; }
</style>
