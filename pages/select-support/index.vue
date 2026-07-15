<template>
  <view class="page">
    <!-- 主内容 -->
    <view class="main">
      <view class="section-header">
        <text class="section-title">选择专项客服</text>
        <text class="section-desc">请选择您需要咨询的业务领域，系统将为您接入对应的专业顾问。</text>
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
            <text class="cat-action-text" :style="{ color: item.accentColor }">
              {{ selectedCategory === item.name ? '已选择 ✓' : '选择接入 →' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 加载客服 -->
      <view v-if="loadingKf" class="loading-state">
        <text>加载客服列表中...</text>
      </view>

      <!-- 客服账号列表 -->
      <view v-if="kfAccounts.length > 0 && !loadingKf" class="kf-section">
        <view class="section-label">
          <text class="label-text">{{ selectedCategory }} · 在线顾问</text>
        </view>
        <view class="kf-list">
          <view class="kf-card" v-for="(kf, idx) in kfAccounts" :key="idx" @tap="openKfChat(kf)">
            <view class="kf-avatar">
              <image v-if="kf.avatar" :src="kf.avatar" mode="aspectFill" class="kf-avatar-img" />
              <text v-else class="kf-avatar-emoji">🧑‍💼</text>
            </view>
            <view class="kf-info">
              <text class="kf-name">{{ kf.name }}</text>
              <text class="kf-desc">{{ kf.description || '专业顾问，为您提供一对一服务' }}</text>
            </view>
            <view class="kf-action">
              <text class="kf-btn">接入 →</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 无客服 -->
      <view v-if="kfAccounts.length === 0 && !loadingKf && selectedCategory" class="empty-state">
        <text class="empty-text">该分类暂无在线顾问</text>
        <text class="empty-desc">请尝试选择其他业务领域</text>
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
import { getWechatKfAccounts } from '@/api/index.js'

export default {
  data() {
    return {
      selectedCategory: '',
      kfAccounts: [],
      loadingKf: false,
      categories: [
        { name: '工商服务', desc: '企业注册、变更、注销及年报等相关业务咨询。', icon: '💼', bgColor: 'rgba(0,95,184,0.1)', accentColor: '#005FB8' },
        { name: '税务服务', desc: '税务申报、发票申领、税收优惠政策解读及筹划。', icon: '💰', bgColor: 'rgba(86,95,113,0.1)', accentColor: '#565F71' },
        { name: '劳动关系', desc: '入职合同、社保公积金、劳资纠纷及离职补偿咨询。', icon: '👥', bgColor: 'rgba(68,71,79,0.1)', accentColor: '#44474E' },
        { name: '法律事务', desc: '合同审核、知识产权保护、企业合规及法律风险把控。', icon: '⚖️', bgColor: 'rgba(0,95,184,0.1)', accentColor: '#005FB8' }
      ]
    }
  },
  methods: {
    async selectCategory(item) {
      // 如果已选中同一分类，刷新列表
      if (this.selectedCategory === item.name) {
        await this.loadKfAccounts(item.name)
        return
      }
      this.selectedCategory = item.name
      await this.loadKfAccounts(item.name)
    },

    async loadKfAccounts(category) {
      this.loadingKf = true
      this.kfAccounts = []
      try {
        const list = await getWechatKfAccounts(category)
        this.kfAccounts = list || []
      } catch (e) {
        console.error('获取客服列表失败:', e)
        uni.showToast({ title: '获取客服列表失败', icon: 'none' })
      } finally {
        this.loadingKf = false
      }
    },

    openKfChat(kf) {
      // #ifdef MP-WEIXIN
      // 通过微信客服 open_kfid 打开指定客服聊天
      uni.navigateTo({
        url: '/pages/support-chat/index?openKfid=' + encodeURIComponent(kf.openKfid) +
             '&kfName=' + encodeURIComponent(kf.name) +
             '&category=' + encodeURIComponent(this.selectedCategory)
      })
      // #endif
      // #ifndef MP-WEIXIN
      uni.showToast({ title: '请在微信小程序中使用客服功能', icon: 'none' })
      // #endif
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-surface); }

.main { padding: 32px 16px 32px; max-width: 800px; margin: 0 auto; }

.section-header { margin-bottom: 32px; }
.section-title { font-size: 28px; font-weight: 800; color: var(--color-on-surface); display: block; margin-bottom: 8px; }
.section-desc { font-size: 14px; color: var(--color-on-surface-variant); }

.category-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
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

/* 客服列表 */
.kf-section { margin-bottom: 24px; }
.section-label { margin-bottom: 12px; }
.label-text { font-size: 16px; font-weight: 700; color: var(--color-on-surface); }
.kf-list { display: flex; flex-direction: column; gap: 12px; }
.kf-card {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 12px; padding: 16px;
  border: 1px solid var(--color-outline-variant, rgba(196,198,208,0.3));
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.kf-card:active { background: rgba(0,95,184,0.03); }
.kf-avatar { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: rgba(0,95,184,0.08); display: flex; align-items: center; justify-content: center; }
.kf-avatar-img { width: 100%; height: 100%; }
.kf-avatar-emoji { font-size: 24px; }
.kf-info { flex: 1; }
.kf-name { font-size: 16px; font-weight: 600; color: var(--color-on-surface); display: block; }
.kf-desc { font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px; }
.kf-action { flex-shrink: 0; }
.kf-btn {
  display: inline-block; padding: 8px 20px; border-radius: 20px;
  background: var(--color-primary, #005FB8); color: #fff;
  font-size: 13px; font-weight: 600;
}

.loading-state, .empty-state { text-align: center; padding: 24px; }
.loading-state text, .empty-text { font-size: 14px; color: var(--color-on-surface-variant); display: block; }
.empty-desc { font-size: 12px; color: var(--color-on-surface-variant); margin-top: 4px; }

.support-banner { border-radius: 16px; overflow: hidden; height: 192px; margin-top: 32px; }
.banner-bg { width: 100%; height: 100%; background: linear-gradient(135deg, rgba(0,95,184,0.85), rgba(0,95,184,0.4)); display: flex; align-items: center; padding: 32px; }
.banner-content { display: flex; flex-direction: column; }
.banner-label { font-size: 11px; color: rgba(255,255,255,0.8); letter-spacing: 2px; margin-bottom: 4px; font-weight: 500; }
.banner-main { font-size: 24px; font-weight: 700; color: #fff; }
.banner-sub { font-size: 12px; color: rgba(255,255,255,0.9); margin-top: 8px; max-width: 200px; }
</style>

