<template>
  <view class="page">
    <!-- 顶部导航 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">我的订单</text>
      <view class="nav-right"></view>
    </view> -->

    <!-- Tab 栏 -->
    <scroll-view class="tab-bar" scroll-x>
      <view class="tab-item" v-for="(tab, idx) in tabs" :key="idx" :class="{ active: activeTab === idx }" @tap="switchTab(idx)">
        <text class="tab-text" :class="{ 'tab-text-active': activeTab === idx }">{{ tab.label }}</text>
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-card" v-for="order in orders" :key="order.id">
        <view class="order-header">
          <text class="order-no">订单编号: {{ order.orderNo }}</text>
          <text class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</text>
        </view>
        <view class="order-body" v-for="(item, iIdx) in order.items" :key="iIdx" :style="iIdx > 0 ? 'margin-top: 12px' : ''">
          <view class="order-img-wrap">
            <view class="order-img-bg">
              <text class="order-img-icon">{{ getItemIcon(item) }}</text>
            </view>
          </view>
          <view class="order-info">
            <text class="order-name">{{ item.name }}</text>
            <text class="order-desc">{{ getOrderTypeLabel(order.orderType) }}</text>
          </view>
          <view class="order-price-wrap">
            <text class="order-price">¥{{ formatPrice(item.price) }}</text>
            <text class="order-qty">x{{ item.quantity }}</text>
          </view>
        </view>
        <!-- 订单合计 -->
        <view class="order-total-row">
          <text class="order-total-label">实付金额</text>
          <text class="order-total-price">¥{{ formatPrice(order.payAmount) }}</text>
        </view>
        <view class="order-divider"></view>
        <view class="order-footer">
          <text class="order-time" :class="order.status === 0 ? 'text-error' : ''">
            {{ order.status === 0 ? '待支付' : formatDateTime(order.createdAt) }}
          </text>
          <view class="order-actions">
            <view v-if="order.status === 0" class="order-btn btn-outline" @tap="onCancel(order)">
              <text class="order-btn-text text-secondary">取消</text>
            </view>
            <view v-if="order.status === 0" class="order-btn btn-primary" @tap="onPay(order)">
              <text class="order-btn-text text-primary-white">立即支付</text>
            </view>
            <view v-if="order.status === 1 || order.status === 2" class="order-btn btn-outline" @tap="onRefund(order)">
              <text class="order-btn-text text-secondary">申请退款</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && orders.length === 0" class="empty-state">
        <view class="empty-icon-wrap">
          <text class="empty-icon">📋</text>
        </view>
        <text class="empty-title">暂无相关订单</text>
        <text class="empty-desc">快去探索您需要的专业服务吧</text>
        <view class="empty-btn" @tap="goHome">
          <text class="empty-btn-text">前往首页</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="!loading && orders.length > 0 && hasMore" class="load-more" @tap="loadMore">
        <text class="load-more-text">加载更多</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrders, cancelOrder, invokePayment, refundOrder } from '@/api/index.js'

// 订单类型图标映射
const TYPE_ICONS = {
  1: '📄', // 内容购买
  2: '👑', // 会员订阅
  3: '💬', // 咨询付费
}

// 订单明细类型图标
const ITEM_ICONS = {
  1: '📄', // content
  2: '👑', // membership
  3: '💬', // consult
  4: '📂', // category
  5: '📑', // template
}

export default {
  data() {
    return {
      activeTab: 0,
      tabs: [
        { label: '全部', status: null },
        { label: '待支付', status: 0 },
        { label: '已完成', status: 3 },
      ],
      orders: [],
      loading: false,
      page: 1,
      pageSize: 10,
      hasMore: false,
      total: 0,
    }
  },
  onLoad() {
    // 未登录跳转登录页
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.redirectTo({
        url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/orders/index'),
        fail: () => uni.reLaunch({ url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/orders/index') })
      })
      return
    }
    this.loadOrders()
  },
  onPullDownRefresh() {
    this.page = 1
    this.orders = []
    this.loadOrders().then(() => uni.stopPullDownRefresh())
  },
  methods: {
    goBack() { uni.navigateBack() },
    goHome() { uni.switchTab({ url: '/pages/index/index' }) },

    switchTab(idx) {
      if (this.activeTab === idx) return
      this.activeTab = idx
      this.page = 1
      this.orders = []
      this.loadOrders()
    },

    async loadOrders() {
      this.loading = true
      try {
        const params = { page: this.page, pageSize: this.pageSize }
        const tab = this.tabs[this.activeTab]
        if (tab.status !== null && tab.status !== undefined) {
          params.status = tab.status
        }
        const res = await getOrders(params)
        const list = res?.list || []
        if (this.page === 1) {
          this.orders = list
        } else {
          this.orders = this.orders.concat(list)
        }
        this.total = res?.total || 0
        this.hasMore = this.orders.length < this.total
      } catch (e) {
        console.error('加载订单失败:', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    loadMore() {
      if (this.loading || !this.hasMore) return
      this.page++
      this.loadOrders()
    },

    // 状态文本
    getStatusText(status) {
      const map = { 0: '待支付', 1: '已支付', 2: '服务中', 3: '已完成', 4: '已退款', 5: '已取消' }
      return map[status] || '未知'
    },

    // 状态样式
    getStatusClass(status) {
      const map = { 0: 'status-pending', 1: 'status-paid', 2: 'status-active', 3: 'status-done', 4: 'status-refund', 5: 'status-cancel' }
      return map[status] || ''
    },

    // 订单类型标签
    getOrderTypeLabel(type) {
      const map = { 1: '内容购买', 2: '会员订阅', 3: '咨询付费' }
      return map[type] || '其他'
    },

    // 明细图标
    getItemIcon(item) {
      return ITEM_ICONS[item.itemType] || TYPE_ICONS[item.itemType] || '📦'
    },

    formatPrice(val) {
      return val != null ? Number(val).toFixed(2) : '0.00'
    },

    formatDateTime(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },

    // 取消订单
    onCancel(order) {
      uni.showModal({
        title: '确认取消',
        content: `确定取消订单「${order.orderNo}」吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await cancelOrder(order.id)
              uni.showToast({ title: '订单已取消', icon: 'success' })
              order.status = 5
            } catch (e) {
              uni.showToast({ title: e.message || '取消失败', icon: 'none' })
            }
          }
        }
      })
    },

    // 支付订单
    async onPay(order) {
      try {
        uni.showLoading({ title: '支付中...' })
        await invokePayment(order.id)
        uni.hideLoading()
        uni.showToast({ title: '支付成功', icon: 'success' })
        order.status = 1
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: e.message || '支付失败', icon: 'none' })
      }
    },

    // 申请退款
    onRefund(order) {
      uni.showModal({
        title: '确认退款',
        content: `确定对订单「${order.orderNo}」申请退款吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await refundOrder(order.id)
              uni.showToast({ title: '退款申请已提交', icon: 'success' })
              order.status = 4
            } catch (e) {
              uni.showToast({ title: e.message || '操作失败', icon: 'none' })
            }
          }
        }
      })
    },
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
  position: sticky; top: 10px; z-index: 40;
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
.status-pending { color: #ba1a1a; background: #ffdad6; }
.status-paid { color: #006b3e; background: #9cf5c2; }
.status-active { color: var(--color-primary); background: rgba(0,83,205,0.1); }
.status-done { color: var(--color-on-surface-variant); background: var(--color-surface-container-low); }
.status-refund { color: #7c5800; background: #ffe9a6; }
.status-cancel { color: #909399; background: #f0f0f0; }

.order-body { display: flex; align-items: center; }
.order-img-wrap { width: 56px; height: 56px; border-radius: 8px; overflow: hidden; flex-shrink: 0; margin-right: 12px; }
.order-img-bg { width: 100%; height: 100%; background: var(--color-surface-container); display: flex; align-items: center; justify-content: center; }
.order-img-icon { font-size: 24px; }
.order-info { flex: 1; }
.order-name { font-size: 14px; font-weight: 500; color: var(--color-on-surface); display: block; }
.order-desc { font-size: 11px; color: var(--color-on-surface-variant); margin-top: 2px; }
.order-price-wrap { text-align: right; }
.order-price { font-size: 16px; font-weight: 600; color: var(--color-on-surface); display: block; }
.order-qty { font-size: 11px; color: var(--color-outline); }

.order-total-row { display: flex; justify-content: flex-end; align-items: center; margin-top: 12px; padding-top: 8px; border-top: 1px dashed rgba(194,198,216,0.4); }
.order-total-label { font-size: 12px; color: var(--color-on-surface-variant); margin-right: 8px; }
.order-total-price { font-size: 18px; font-weight: 700; color: var(--color-primary); }

.order-divider { height: 1px; background: rgba(194,198,216,0.3); margin: 8px 0; }
.order-footer { display: flex; justify-content: space-between; align-items: center; }
.order-time { font-size: 11px; color: var(--color-on-surface-variant); }
.text-error { color: #ba1a1a; }
.order-actions { display: flex; align-items: center; }
.order-btn { padding: 8px 16px; border-radius: 12px; margin-left: 8px; }
.order-btn:first-child { margin-left: 0; }
.btn-primary { background: var(--color-primary); }
.btn-outline { border: 1px solid var(--color-outline); }
.text-primary-white { color: #fff; font-size: 12px; font-weight: 500; }
.text-secondary { color: var(--color-on-surface-variant); font-size: 12px; font-weight: 500; }

.loading-state { text-align: center; padding: 32px 0; }
.loading-text { font-size: 13px; color: var(--color-on-surface-variant); }

.empty-state { display: flex; flex-direction: column; align-items: center; padding-top: 80px; }
.empty-icon-wrap { width: 128px; height: 128px; border-radius: 64px; background: var(--color-surface-container); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.empty-icon { font-size: 40px; }
.empty-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); }
.empty-desc { font-size: 14px; color: var(--color-on-surface-variant); margin-top: 8px; }
.empty-btn { margin-top: 32px; padding: 12px 40px; background: var(--color-primary); border-radius: 24px; }
.empty-btn-text { color: #fff; font-size: 16px; }

.load-more { text-align: center; padding: 24px 0; }
.load-more-text { font-size: 13px; color: var(--color-primary); }
</style>
