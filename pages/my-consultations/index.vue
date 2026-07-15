<template>
  <view class="page">
    <!-- 顶部导航 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">我的咨询</text>
      <view class="nav-right"></view>
    </view> -->

    <!-- 主内容 -->
    <view class="main">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-input">
          <text class="search-icon">🔍</text>
          <input class="input-field" placeholder="搜索咨询记录..." v-model="searchText" />
        </view>
        <view class="filter-btn">
          <text class="filter-icon">⚙️</text>
        </view>
      </view>

      <!-- 咨询列表 -->
      <view class="inquiry-list">
        <view class="inquiry-card" v-for="(item, idx) in consultations" :key="idx" @tap="openChat(item)">
          <view class="avatar-wrap">
            <view v-if="item.isBot" class="avatar-bot">
              <text class="avatar-emoji">🤖</text>
            </view>
            <view v-else class="avatar-text" :class="{ grayscale: item.status === 'closed' }">
              <text class="avatar-name-icon">{{ item.name[0] }}</text>
            </view>
            <view v-if="item.online" class="online-dot"></view>
          </view>
          <view class="inquiry-content">
            <view class="inquiry-top">
              <text class="inquiry-name">{{ item.name }}</text>
              <text class="inquiry-time">{{ item.time }}</text>
            </view>
            <text class="inquiry-msg">{{ item.message }}</text>
            <view class="inquiry-bottom">
              <view class="status-tag" :class="item.statusClass">
                <view v-if="item.statusDot" class="status-dot"></view>
                <text class="status-text">{{ item.statusText }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="consultations.length === 0" class="empty-state">
        <view class="empty-icon-wrap">
          <text class="empty-icon">💬</text>
        </view>
        <text class="empty-text">暂无咨询记录</text>
        <view class="empty-btn" @tap="newConsult">
          <text class="empty-btn-text">发起新咨询</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      consultations: [
        { name: '李美华', time: '10:45', message: '关于您提交的企业资质审核申请，我方已经初审完毕...', status: 'active', statusText: '咨询中', statusClass: 'active-tag', statusDot: true, online: true, isBot: false },
        { name: '张伟', time: '昨天', message: '好的，如果您后续还有任何税务方面的疑问，欢迎随时联系。', status: 'closed', statusText: '已结案', statusClass: 'closed-tag', statusDot: false, online: false, isBot: false },
        { name: '在线客服 012', time: '周二', message: '正在为您连接后端工程师，请稍候片刻。', status: 'active', statusText: '处理中', statusClass: 'active-tag', statusDot: true, online: false, isBot: true },
        { name: '王菁律所', time: '05-12', message: '法律建议书已发送至您的企业邮箱，请注意查收。', status: 'closed', statusText: '已结案', statusClass: 'closed-tag', statusDot: false, online: false, isBot: false }
      ]
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    openChat(item) {
      uni.navigateTo({ url: '/pages/support-chat/index' })
    },
    newConsult() {
      uni.switchTab({ url: '/pages/qa/index' })
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
.nav-title { font-size: 18px; font-weight: 600; color: var(--color-primary); position: absolute; left: 50%; transform: translateX(-50%); }
.nav-right { width: 24px; }
.main { padding: 20px 16px 32px; }

.search-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; }
.search-input {
  flex: 1; background: var(--color-surface-container-low); border-radius: 12px;
  padding: 8px 16px; display: flex; align-items: center; gap: 8px;
}
.search-icon { font-size: 18px; }
.input-field { background: transparent; border: none; font-size: 14px; flex: 1; color: var(--color-on-surface); }
.filter-btn { padding: 8px; background: var(--color-surface-container-low); border-radius: 12px; }
.filter-icon { font-size: 18px; }

.inquiry-list { display: flex; flex-direction: column; gap: 16px; }
.inquiry-card {
  background: #fff; border-radius: 12px; padding: 16px;
  display: flex; gap: 16px; border: 1px solid rgba(194,198,216,0.3);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar-text, .avatar-bot {
  width: 48px; height: 48px; border-radius: 24px;
  display: flex; align-items: center; justify-content: center;
}
.avatar-text { background: var(--color-primary-container); }
.avatar-bot { background: rgba(0,83,205,0.1); }
.avatar-name-icon { font-size: 18px; color: var(--color-primary); font-weight: 600; }
.avatar-emoji { font-size: 24px; }
.grayscale { opacity: 0.7; }
.online-dot {
  position: absolute; bottom: 0; right: 0; width: 12px; height: 12px;
  background: #22c55e; border: 2px solid #fff; border-radius: 6px;
}
.inquiry-content { flex: 1; min-width: 0; }
.inquiry-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.inquiry-name { font-size: 18px; font-weight: 600; color: var(--color-on-surface); }
.inquiry-time { font-size: 11px; color: var(--color-on-surface-variant); }
.inquiry-msg { font-size: 14px; color: var(--color-on-surface-variant); margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inquiry-bottom { display: flex; align-items: center; }

.status-tag {
  display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px;
}
.active-tag { background: rgba(0,83,205,0.1); }
.closed-tag { background: var(--color-surface-container-low); }
.status-dot { width: 6px; height: 6px; border-radius: 3px; background: var(--color-primary); margin-right: 6px; }
.status-text { font-size: 12px; font-weight: 500; }
.active-tag .status-text { color: var(--color-primary); }
.closed-tag .status-text { color: var(--color-on-surface-variant); }

.empty-state { display: flex; flex-direction: column; align-items: center; padding-top: 80px; }
.empty-icon-wrap { width: 80px; height: 80px; border-radius: 40px; background: var(--color-surface-container-low); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.empty-icon { font-size: 36px; }
.empty-text { font-size: 16px; color: var(--color-on-surface-variant); }
.empty-btn { margin-top: 24px; padding: 8px 24px; background: var(--color-primary); border-radius: 20px; }
.empty-btn-text { color: #fff; font-size: 12px; font-weight: 500; }
</style>
