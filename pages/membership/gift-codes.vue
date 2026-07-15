<template>
  <view class="page">
    <!-- 导航栏 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">我的礼品码</text>
      <view class="nav-right"></view>
    </view> -->

    <view class="content">
      <!-- 加载中 -->
      <view v-if="loading" class="loading-wrap">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="orders.length === 0" class="empty-wrap">
        <text class="empty-icon">🎁</text>
        <text class="empty-text">还没有购买过礼品码</text>
        <view class="empty-btn" @tap="goBuy">
          <text>去购买</text>
        </view>
      </view>

      <!-- 订单列表 -->
      <view v-else>
        <view class="order-card" v-for="(order, idx) in orders" :key="order.id"
          :class="{ expanded: expandedIdx === idx }">
          <view class="order-header" @tap="toggleExpand(idx, order)">
            <view class="order-info">
              <text class="order-tier-name">{{ order.tier?.name || '会员套餐' }}</text>
              <text class="order-meta">x{{ order.quantity }} | {{ order.status === 1 ? '已激活' : '待支付' }}</text>
            </view>
            <view class="order-stats" v-if="order.status === 1">
              <text class="stat-redeemed">{{ order.redeemedCount }}已兑</text>
              <text class="stat-pending">{{ order.pendingCount }}待兑</text>
            </view>
            <text v-if="order.status === 0" class="unpaid-hint">请先支付</text>
            <text v-else class="expand-arrow">{{ expandedIdx === idx ? '▲' : '▼' }}</text>
          </view>

          <!-- 展开的兑换码列表 -->
          <view v-if="expandedIdx === idx" class="order-body">
            <view v-if="order._codesLoading" class="codes-loading">
              <text>加载中...</text>
            </view>
            <view v-else>
              <view class="code-item" v-for="code in order._codes" :key="code.id">
                <view class="code-left">
                  <text class="code-value">{{ code.code }}</text>
                  <text class="code-status" :class="'status-' + code.status">
                    {{ codeStatusLabel(code.status) }}
                  </text>
                </view>
                <view class="code-right">
                  <view v-if="code.status === 0" class="copy-btn" @tap="copyCode(code.code)">
                    <text>复制</text>
                  </view>
                  <text v-else-if="code.status === 1" class="redeemed-info">已兑换</text>
                </view>
              </view>
              <view v-if="order._codes.length > 0" class="share-row">
                <view class="share-btn" @tap="copyAllCodes(order._codes)">
                  <text>复制全部未兑换码</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyGiftOrders, getGiftOrderCodes } from '@/api/index.js'

export default {
  data() {
    return {
      loading: true,
      orders: [],
      expandedIdx: -1
    }
  },
  onLoad() {
    this.loadOrders()
  },
  onPullDownRefresh() {
    this.loadOrders().then(() => uni.stopPullDownRefresh())
  },
  methods: {
    goBack() { uni.navigateBack() },
    goBuy() { uni.navigateTo({ url: '/pages/membership/index' }) },

    codeStatusLabel(s) {
      return ['未兑换', '已兑换', '已作废'][s] || '未知'
    },

    async loadOrders() {
      this.loading = true
      try {
        const res = await getMyGiftOrders()
        this.orders = (res || []).map(o => ({
          ...o,
          _codes: [],
          _codesLoading: false
        }))
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    async toggleExpand(idx, order) {
      // 未支付订单不允许展开查看兑换码
      if (order.status === 0) {
        uni.showToast({ title: '请先完成支付', icon: 'none' })
        return
      }
      if (this.expandedIdx === idx) {
        this.expandedIdx = -1
        return
      }
      this.expandedIdx = idx
      if (order._codes.length === 0 && !order._codesLoaded) {
        order._codesLoading = true
        try {
          const res = await getGiftOrderCodes(order.id)
          order._codes = res || []
          order._codesLoaded = true
        } catch (e) {
          uni.showToast({ title: '加载兑换码失败', icon: 'none' })
        } finally {
          order._codesLoading = false
        }
      }
    },

    copyCode(code) {
      uni.setClipboardData({
        data: code,
        success: () => uni.showToast({ title: '已复制', icon: 'success' })
      })
    },

    copyAllCodes(codes) {
      const pending = codes.filter(c => c.status === 0).map(c => c.code)
      if (pending.length === 0) {
        uni.showToast({ title: '没有未兑换的码', icon: 'none' })
        return
      }
      const text = pending.join('\n')
      uni.setClipboardData({
        data: text,
        success: () => uni.showToast({ title: `已复制${pending.length}个兑换码`, icon: 'success' })
      })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; }
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 48px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: #fff;
}
.nav-icon { font-size: 20px; color: var(--color-primary); }
.nav-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); }
.nav-right { width: 24px; }

.content { padding: 60px 16px 16px; }

.loading-wrap, .empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 60px 0; gap: 12px;
}
.empty-icon { font-size: 48px; }
.empty-text { font-size: 14px; color: #999; }
.empty-btn {
  margin-top: 8px; padding: 10px 32px; border-radius: 20px;
  background: var(--color-primary); color: #fff; font-size: 14px; font-weight: 600;
}

.order-card {
  background: #fff; border-radius: 12px; margin-bottom: 12px;
  overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.order-header {
  display: flex; align-items: center; padding: 16px;
  gap: 12px;
}
.order-info { flex: 1; }
.order-tier-name { font-size: 15px; font-weight: 600; color: var(--color-on-surface); display: block; }
.order-meta { font-size: 12px; color: #999; display: block; margin-top: 2px; }
.unpaid-hint { font-size: 12px; color: #fa8c16; }
.order-stats { display: flex; gap: 8px; }
.stat-redeemed { font-size: 12px; color: #67c23a; }
.stat-pending { font-size: 12px; color: #909399; }
.expand-arrow { font-size: 12px; color: #ccc; }

.order-body { padding: 0 16px 16px; border-top: 1px solid #f0f0f0; }
.codes-loading { text-align: center; padding: 16px; color: #999; font-size: 13px; }

.code-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid #f5f5f5;
}
.code-item:last-child { border-bottom: none; }
.code-left { display: flex; align-items: center; gap: 8px; }
.code-value { font-size: 14px; font-weight: 500; font-family: monospace; letter-spacing: 0.5px; }
.code-status { font-size: 11px; padding: 2px 6px; border-radius: 4px; }
.status-0 { background: #fff7e6; color: #fa8c16; }
.status-1 { background: #f0f9eb; color: #67c23a; }
.status-2 { background: #fef0f0; color: #f56c6c; }

.copy-btn {
  padding: 4px 12px; border-radius: 6px; border: 1px solid var(--color-primary);
  font-size: 12px; color: var(--color-primary);
}
.redeemed-info { font-size: 12px; color: #999; }

.share-row { margin-top: 12px; text-align: center; }
.share-btn {
  display: inline-block; padding: 8px 24px; border-radius: 8px;
  background: #f0f5ff; color: var(--color-primary); font-size: 13px; font-weight: 500;
}
</style>
