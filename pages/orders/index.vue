<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">我的订单</text>
      <view class="nav-right"></view>
    </view>

    <!-- Tab 栏 -->
    <scroll-view class="tab-bar" scroll-x>
      <view class="tab-item" v-for="(tab, idx) in tabs" :key="idx" :class="{ active: activeTab === idx }" @tap="activeTab = idx">
        <text class="tab-text" :class="{ 'tab-text-active': activeTab === idx }">{{ tab }}</text>
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-card" v-for="(order, idx) in filteredOrders" :key="idx">
        <view class="order-header">
          <text class="order-no">订单编号: {{ order.no }}</text>
          <text class="order-status" :class="order.statusClass">{{ order.status }}</text>
        </view>
        <view class="order-body">
          <view class="order-img-wrap">
            <view class="order-img-bg">
              <text class="order-img-icon">{{ order.icon }}</text>
            </view>
          </view>
          <view class="order-info">
            <text class="order-name">{{ order.name }}</text>
            <text class="order-desc">{{ order.desc }}</text>
          </view>
          <view class="order-price-wrap">
            <text class="order-price">¥{{ order.price }}</text>
            <text class="order-qty">x1</text>
          </view>
        </view>
        <view class="order-divider"></view>
        <view class="order-footer">
          <text class="order-time" :class="order.timeClass">{{ order.timeLabel }}</text>
          <view class="order-actions">
            <view v-for="(btn, bIdx) in order.buttons" :key="bIdx" class="order-btn" :class="btn.class" @tap="onBtnTap(btn)">
              <text class="order-btn-text" :class="btn.textClass">{{ btn.text }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredOrders.length === 0" class="empty-state">
        <view class="empty-icon-wrap">
          <text class="empty-icon">📋</text>
        </view>
        <text class="empty-title">暂无相关订单</text>
        <text class="empty-desc">快去探索您需要的专业服务吧</text>
        <view class="empty-btn" @tap="goHome">
          <text class="empty-btn-text">前往首页</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 0,
      tabs: ['全部', '待支付', '已完成'],
      orders: [
        {
          no: '#SRV-92834', status: '服务中', statusClass: 'status-active',
          icon: '👥', name: '人力资源咨询', desc: '人力资源合规与流程优化服务',
          price: '9.90', timeLabel: '下单时间: 2023-11-20 14:30', timeClass: '',
          filter: 'all',
          buttons: [
            { text: '申请退款', class: 'btn-outline', textClass: 'text-secondary', action: 'refund' },
            { text: '查看进度', class: 'btn-primary', textClass: 'text-primary-white', action: 'progress' }
          ]
        },
        {
          no: '#SRV-81722', status: '已完成', statusClass: 'status-done',
          icon: '📚', name: '法律顾问', desc: '企业年度法律顾问咨询',
          price: '599.00', timeLabel: '下单时间: 2023-10-15 09:12', timeClass: '',
          filter: 'done',
          buttons: [
            { text: '再次购买', class: 'btn-ghost', textClass: 'text-secondary', action: 'rebuy' },
            { text: '评价', class: 'btn-outline-primary', textClass: 'text-primary', action: 'review' }
          ]
        },
        {
          no: '#SRV-77210', status: '待支付', statusClass: 'status-pending',
          icon: '📊', name: '数字营销', desc: '全渠道数字化转型营销方案',
          price: '1,200.00', timeLabel: '剩余支付时间: 14:59', timeClass: 'text-error',
          filter: 'pending',
          buttons: [
            { text: '取消', class: 'btn-outline', textClass: 'text-secondary', action: 'cancel' },
            { text: '立即支付', class: 'btn-primary', textClass: 'text-primary-white', action: 'pay' }
          ]
        }
      ]
    }
  },
  computed: {
    filteredOrders() {
      if (this.activeTab === 0) return this.orders
      const filterMap = { 1: 'pending', 2: 'done' }
      return this.orders.filter(o => o.filter === filterMap[this.activeTab])
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    goHome() { uni.switchTab({ url: '/pages/index/index' }) },
    onBtnTap(btn) {
      const msgs = { refund: '申请退款', progress: '查看进度', rebuy: '再次购买', review: '评价', cancel: '取消订单', pay: '跳转支付' }
      uni.showToast({ title: msgs[btn.action] || btn.text, icon: 'none' })
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
.nav-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); }
.nav-right { width: 24px; }

.tab-bar {
  position: sticky; top: 56px; z-index: 40;
  white-space: nowrap; padding: 16px; background: rgba(255,255,255,0.9);
}
.tab-item {
  display: inline-block; padding: 8px 24px; border-radius: 12px;
  background: var(--color-surface-container); margin-right: 16px;
}
.tab-item:last-child { margin-right: 0; }
.tab-item.active { background: var(--color-primary); }
.tab-text { font-size: 12px; font-weight: 500; color: var(--color-on-surface-variant); }
.tab-text-active { color: #fff; }

.order-list { padding: 16px; display: flex; flex-direction: column; }
.order-card {
  background: #fff; border-radius: 12px; padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid rgba(194,198,216,0.3);
  margin-bottom: 16px;
}
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.order-no { font-size: 11px; color: var(--color-outline); letter-spacing: 1px; }
.order-status { font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 4px; }
.status-active { color: var(--color-primary); background: rgba(0,83,205,0.1); }
.status-done { color: var(--color-on-surface-variant); background: var(--color-surface-container-low); }
.status-pending { color: #ba1a1a; background: #ffdad6; }

.order-body { display: flex; align-items: center; }
.order-img-wrap { width: 64px; height: 64px; border-radius: 8px; overflow: hidden; flex-shrink: 0; margin-right: 16px; }
.order-img-bg { width: 100%; height: 100%; background: var(--color-surface-container); display: flex; align-items: center; justify-content: center; }
.order-img-icon { font-size: 28px; }
.order-info { flex: 1; }
.order-name { font-size: 16px; font-weight: 400; color: var(--color-on-surface); display: block; }
.order-desc { font-size: 11px; color: var(--color-on-surface-variant); margin-top: 2px; }
.order-price-wrap { text-align: right; }
.order-price { font-size: 18px; font-weight: 600; color: var(--color-on-surface); display: block; }
.order-qty { font-size: 11px; color: var(--color-outline); }

.order-divider { height: 1px; background: rgba(194,198,216,0.3); margin: 8px 0; }
.order-footer { display: flex; justify-content: space-between; align-items: center; }
.order-time { font-size: 11px; color: var(--color-on-surface-variant); }
.text-error { color: #ba1a1a; }
.order-actions { display: flex; align-items: center; }
.order-btn { padding: 8px 16px; border-radius: 12px; margin-left: 8px; }
.order-btn:first-child { margin-left: 0; }
.btn-primary { background: var(--color-primary); }
.btn-outline { border: 1px solid var(--color-outline); }
.btn-ghost { background: var(--color-surface-container); }
.btn-outline-primary { border: 1px solid var(--color-primary); }
.text-primary-white { color: #fff; font-size: 12px; font-weight: 500; }
.text-secondary { color: var(--color-on-surface-variant); font-size: 12px; font-weight: 500; }
.text-primary { color: var(--color-primary); font-size: 12px; font-weight: 500; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding-top: 80px; }
.empty-icon-wrap { width: 128px; height: 128px; border-radius: 64px; background: var(--color-surface-container); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.empty-icon { font-size: 40px; }
.empty-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); }
.empty-desc { font-size: 14px; color: var(--color-on-surface-variant); margin-top: 8px; }
.empty-btn { margin-top: 32px; padding: 12px 40px; background: var(--color-primary); border-radius: 24px; }
.empty-btn-text { color: #fff; font-size: 16px; }
</style>
