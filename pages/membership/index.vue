<template>
  <view class="page">
    <!-- 顶部导航 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">会员方案</text>
      <view class="nav-right"></view>
    </view> -->

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

    <!-- 当前订阅状态 -->
    <view v-if="currentSub" class="current-sub">
      <view class="current-sub-inner">
        <view class="current-sub-left">
          <text class="current-sub-label">当前方案</text>
          <text class="current-sub-name">{{ currentSub.tier.name }}</text>
          <text class="current-sub-date">有效期至 {{ formatDate(currentSub.endDate) }}（剩余{{ remainingDays }}天）</text>
        </view>
        <view class="current-sub-badge">
          <text class="current-sub-badge-text">Lv.{{ currentSub.tier.level }}</text>
        </view>
      </view>
    </view>

    <!-- 层级选择 -->
    <view class="tier-section">
      <scroll-view class="tier-scroll" scroll-x>
        <view class="tier-card" v-for="(tier, idx) in tiers" :key="tier.id"
          :class="{ active: selectedIdx === idx, 'is-current': isCurrentTier(tier) }"
          @tap="selectTier(idx)">
          <view class="tier-header">
            <view class="tier-badges">
              <text class="tier-badge" :class="getBadgeClass(idx)">L{{ tier.level }}</text>
              <text v-if="idx === 1" class="tier-recommend">主推推荐款</text>
            </view>
            <text class="tier-check" :class="{ checked: selectedIdx === idx }">
              {{ selectedIdx === idx ? '●' : '○' }}
            </text>
          </view>
          <text class="tier-name">{{ tier.name }}</text>
          <text class="tier-sub">{{ tier.description || '' }}</text>
          <view class="tier-price-row">
            <text class="tier-price">¥{{ tier.price }}</text>
            <text class="tier-unit">/{{ tier.period || '年' }}</text>
          </view>
          <!-- 升级/续费提示 -->
          <view v-if="getTierAction(tier).label" class="tier-action-hint">
            <text class="tier-action-text">{{ getTierAction(tier).label }}</text>
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
          <view class="feature-row" v-for="(feat, idx) in currentFeatures" :key="idx"
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
    <view class="bottom-bar" v-if="tiers.length > 0">
      <view class="bottom-bar-top">
        <view class="redeem-btn" @tap="showRedeemPopup = true">
          <text class="redeem-btn-text">兑换码</text>
        </view>
        <view class="gift-btn" @tap="showGiftPopup = true">
          <text class="gift-btn-text">送礼品</text>
        </view>
      </view>
      <view class="bottom-bar-main">
        <view class="price-wrap">
          <text class="price-label">{{ actionLabel }}</text>
          <view class="price-row">
            <text class="price-value">¥{{ payAmount }}</text>
            <text v-if="payAmount > 0" class="price-suffix"></text>
          </view>
        </view>
        <view class="buy-btn" :class="{ disabled: buying }" @tap="onBuy">
          <text class="buy-text">{{ buyBtnText }}</text>
          <text class="buy-arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 兑换码弹窗 -->
    <view v-if="showRedeemPopup" class="redeem-mask" @tap="showRedeemPopup = false">
      <view class="redeem-popup" @tap.stop>
        <view class="redeem-popup-header">
          <text class="redeem-popup-title">兑换会员</text>
          <view class="redeem-popup-close" @tap="showRedeemPopup = false">
            <text>✕</text>
          </view>
        </view>
        <view class="redeem-popup-body">
          <text class="redeem-hint">请输入12位兑换码</text>
          <input
            class="redeem-input"
            v-model="redeemInput"
            placeholder="ES-XXXX-XXXX-XXXX"
            maxlength="20"
            :focus="showRedeemPopup"
          />
          <view class="redeem-confirm-btn" :class="{ disabled: redeeming || !redeemInput.trim() }" @tap="handleRedeem">
            <text>{{ redeeming ? '兑换中...' : '立即兑换' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 送礼品弹窗 -->
    <view v-if="showGiftPopup" class="redeem-mask" @tap="showGiftPopup = false">
      <view class="redeem-popup" @tap.stop>
        <view class="redeem-popup-header">
          <text class="redeem-popup-title">购买礼品码</text>
          <view class="redeem-popup-close" @tap="showGiftPopup = false">
            <text>✕</text>
          </view>
        </view>
        <view class="redeem-popup-body">
          <text class="redeem-hint">选择套餐和数量，购买后分享给好友</text>
          <view class="gift-tier-list">
            <view v-for="(tier, idx) in tiers" :key="tier.id"
              class="gift-tier-item" :class="{ active: giftTierIdx === idx }"
              @tap="giftTierIdx = idx">
              <text class="gift-tier-name">{{ tier.name }}</text>
              <text class="gift-tier-price">¥{{ tier.price }}/{{ tier.period || '年' }}</text>
            </view>
          </view>
          <view class="gift-qty-row">
            <text class="gift-qty-label">数量</text>
            <view class="gift-qty-ctrl">
              <view class="qty-btn" @tap="giftQty > 1 && giftQty--">-</view>
              <text class="qty-val">{{ giftQty }}</text>
              <view class="qty-btn" @tap="giftQty < 50 && giftQty++">+</view>
            </view>
          </view>
          <view class="gift-total-row">
            <text>合计：</text>
            <text class="gift-total-price">¥{{ giftTotalPrice }}</text>
          </view>
          <view class="redeem-confirm-btn" :class="{ disabled: giftBuying }" @tap="handleGiftBuy">
            <text>{{ giftBuying ? '创建中...' : '立即购买' }}</text>
          </view>
          <view class="gift-my-codes" @tap="goToGiftCodes">
            <text>我的礼品码 →</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMembershipTiers, getMySubscription, purchaseMembership, invokePayment, redeemCode, createGiftOrder } from '@/api/index.js'

const FEATURE_ICONS = {
  '流程图游览/下载': '🌳',
  'AI智能问答': '🤖',
  '线上咨询(20分钟/次)': '💬',
  '模块风险测评报告': '📊',
  '模块计算器': '🧮',
  '客户文件分析报告': '📄',
  '上门专项咨询': '🎧',
}

export default {
  data() {
    return {
      tiers: [],
      selectedIdx: 0,
      currentSub: null,
      remainingDays: 0,
      buying: false,
      loading: true,
      showRedeemPopup: false,
      redeemInput: '',
      redeeming: false,
      showGiftPopup: false,
      giftTierIdx: 0,
      giftQty: 1,
      giftBuying: false
    }
  },
  computed: {
    selectedTier() {
      return this.tiers[this.selectedIdx] || null
    },
    currentFeatures() {
      const tier = this.selectedTier
      if (!tier || !tier.features) return []
      let features
      try {
        features = typeof tier.features === 'string' ? JSON.parse(tier.features) : tier.features
      } catch { return [] }
      return Object.entries(features).map(([name, value]) => {
        const isCheck = value === true || value === 'true'
        const dimmed = value === false || value === 'false' || value === '/' || value === null
        return {
          icon: FEATURE_ICONS[name] || '📋',
          name,
          value: isCheck ? '✓' : (dimmed ? '/' : String(value)),
          isCheck,
          dimmed
        }
      })
    },
    /** 当前操作类型 */
    currentAction() {
      const tier = this.selectedTier
      if (!tier) return { type: 'new', label: '购买', amount: 0 }
      return this.getTierAction(tier)
    },
    actionLabel() {
      return this.currentAction.label
    },
    payAmount() {
      return this.currentAction.amount
    },
    buyBtnText() {
      if (this.buying) return '处理中...'
      const t = this.currentAction.type
      if (t === 'renew') return '立即续费'
      if (t === 'upgrade') return '立即升级'
      if (t === 'current') return '已是当前方案'
      return '立即选购'
    },
    giftTotalPrice() {
      const tier = this.tiers[this.giftTierIdx]
      return tier ? (tier.price * this.giftQty).toFixed(2) : '0.00'
    }
  },
  onLoad() {
    this.loadData()
  },
  methods: {
    goBack() { uni.navigateBack() },
    selectTier(idx) { this.selectedIdx = idx },

    getBadgeClass(idx) {
      return ['badge-light', 'badge-primary', 'badge-dark'][idx] || 'badge-light'
    },

    isCurrentTier(tier) {
      return this.currentSub && this.currentSub.tier && this.currentSub.tier.id === tier.id
    },

    /** 计算某方案的操作类型和价格 */
    getTierAction(tier) {
      if (!this.currentSub || !this.currentSub.tier) {
        // 无订阅 → 新购买
        return { type: 'new', label: '新购', amount: tier.price }
      }
      const curLevel = this.currentSub.tier.level
      const curPrice = this.currentSub.tier.price
      if (tier.id === this.currentSub.tier.id) {
        // 同方案 → 续费
        return { type: 'renew', label: '续费 ¥' + tier.price, amount: tier.price }
      }
      if (tier.level > curLevel) {
        // 升级 → 差额
        const diff = tier.price - curPrice
        return { type: 'upgrade', label: '升级补差 ¥' + diff, amount: diff }
      }
      // 降级 → 不允许
      return { type: 'disabled', label: '', amount: 0 }
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    },

    async loadData() {
      try {
        // 并行加载方案和订阅状态
        const [tiersRes, subRes] = await Promise.allSettled([
          getMembershipTiers(),
          getMySubscription()
        ])

        if (tiersRes.status === 'fulfilled' && tiersRes.value) {
          this.tiers = tiersRes.value
          // 默认选中推荐方案或第一个
          this.selectedIdx = Math.min(1, this.tiers.length - 1)
        }

        if (subRes.status === 'fulfilled' && subRes.value) {
          if (subRes.value.hasSubscription) {
            this.currentSub = subRes.value.subscription
            this.remainingDays = subRes.value.remainingDays || 0
          }
        }
      } catch (e) {
        console.error('加载会员数据失败:', e)
      } finally {
        this.loading = false
      }
    },

    async onBuy() {
      const tier = this.selectedTier
      if (!tier) return
      const action = this.currentAction
      if (action.type === 'disabled' || action.type === 'current') {
        uni.showToast({ title: '无需操作', icon: 'none' })
        return
      }

      // 检查登录
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          const cur = getCurrentPages().pop()
          uni.navigateTo({ url: '/pages/login/index?redirect=' + encodeURIComponent('/' + cur.route) })
        }, 1500)
        return
      }

      // 确认弹窗
      let confirmMsg = ''
      if (action.type === 'new') confirmMsg = `确认购买「${tier.name}」¥${action.amount}？`
      else if (action.type === 'upgrade') confirmMsg = `确认升级至「${tier.name}」补差价 ¥${action.amount}？`
      else if (action.type === 'renew') confirmMsg = `确认续费「${tier.name}」¥${action.amount}？`

      uni.showModal({
        title: '确认订单',
        content: confirmMsg,
        confirmText: '确认支付',
        success: async (res) => {
          if (res.confirm) await this.doPurchase(tier.id)
        }
      })
    },

    async doPurchase(tierId) {
      this.buying = true
      try {
        // 1. 创建订单（后端自动计算差额）
        uni.showLoading({ title: '创建订单...' })
        const orderRes = await purchaseMembership(tierId)

        // 2. 支付
        uni.showLoading({ title: '支付中...' })
        await invokePayment(orderRes.orderId)

        uni.hideLoading()
        uni.showToast({ title: '支付成功', icon: 'success' })

        // 3. 重新加载数据
        await this.loadData()
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: e.message || '操作失败', icon: 'none' })
      } finally {
        this.buying = false
      }
    },

    async handleRedeem() {
      const code = this.redeemInput.trim()
      if (!code) return
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      this.redeeming = true
      try {
        const res = await redeemCode(code)
        uni.showToast({ title: res.message || '兑换成功', icon: 'success' })
        this.showRedeemPopup = false
        this.redeemInput = ''
        await this.loadData()
      } catch (e) {
        uni.showToast({ title: e.message || '兑换失败', icon: 'none' })
      } finally {
        this.redeeming = false
      }
    },

    async handleGiftBuy() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      const tier = this.tiers[this.giftTierIdx]
      if (!tier) return
      this.giftBuying = true
      try {
        const res = await createGiftOrder(tier.id, this.giftQty)
        uni.showLoading({ title: '支付中...' })
        await invokePayment(res.orderId)
        uni.hideLoading()
        uni.showToast({ title: '购买成功', icon: 'success' })
        this.showGiftPopup = false
        // 跳转到礼品码管理页
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/membership/gift-codes' })
        }, 1000)
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: e.message || '购买失败', icon: 'none' })
      } finally {
        this.giftBuying = false
      }
    },

    goToGiftCodes() {
      this.showGiftPopup = false
      uni.navigateTo({ url: '/pages/membership/gift-codes' })
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

/* 当前订阅 */
.current-sub { margin-top: -32px; padding: 0 16px; position: relative; z-index: 31; }
.current-sub-inner {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between;
}
.current-sub-left { flex: 1; }
.current-sub-label { font-size: 11px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 4px; }
.current-sub-name { font-size: 18px; font-weight: 600; color: #fff; display: block; margin-bottom: 4px; }
.current-sub-date { font-size: 11px; color: rgba(255,255,255,0.7); }
.current-sub-badge {
  background: rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 16px;
}
.current-sub-badge-text { color: #ffd700; font-size: 14px; font-weight: 700; }

.tier-section { margin-top: 16px; position: relative; z-index: 30; padding: 0 16px; }
.tier-scroll { white-space: nowrap; padding-bottom: 16px; }
.tier-card {
  display: inline-block; vertical-align: top;
  width: 260px; background: #fff; border-radius: 12px;
  padding: 16px; border: 1px solid var(--color-outline-variant);
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  margin-right: 16px; box-sizing: border-box;
  white-space: normal; position: relative;
}
.tier-card:last-child { margin-right: 0; }
.tier-card.active { border: 2px solid var(--color-primary); background: #f4f7ff; }
.tier-card.is-current::after {
  content: '当前'; position: absolute; top: 8px; right: 8px;
  background: var(--color-primary); color: #fff; font-size: 10px;
  padding: 2px 8px; border-radius: 4px; font-weight: 600;
}
.tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tier-badges { display: flex; }
.tier-badges .tier-badge:last-child { margin-right: 0; }
.tier-badge {
  font-size: 12px; font-weight: 500; padding: 4px 8px; border-radius: 4px; margin-right: 4px;
}
.badge-light { background: rgba(0,83,205,0.1); color: var(--color-primary); }
.badge-primary { background: var(--color-primary); color: #fff; }
.badge-dark { background: #2f3031; color: #f2f0f0; }
.tier-recommend {
  font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #ca4b00; color: #fff;
}
.tier-check { font-size: 18px; color: var(--color-outline-variant); }
.tier-check.checked { color: var(--color-primary); }
.tier-name { font-size: 18px; font-weight: 600; color: var(--color-on-surface); display: block; margin-bottom: 4px; }
.tier-sub { font-size: 11px; color: var(--color-secondary); display: block; margin-bottom: 16px; }
.tier-price-row { display: flex; align-items: baseline; gap: 4px; }
.tier-price { font-size: 24px; font-weight: 600; color: var(--color-primary); }
.tier-unit { font-size: 11px; color: var(--color-secondary); }
.tier-action-hint { margin-top: 8px; }
.tier-action-text { font-size: 11px; color: var(--color-tertiary); font-weight: 600; }

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
.feature-value { font-size: 12px; font-weight: 500; color: var(--color-on-surface-variant); }
.feature-check { color: var(--color-primary); font-weight: 700; font-size: 16px; }

.legend-row { display: flex; align-items: center; gap: 8px; padding: 16px 8px; }
.legend-dot { width: 8px; height: 8px; border-radius: 4px; background: var(--color-primary); }
.legend-text { font-size: 11px; color: var(--color-secondary); }

.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  background: #fff; border-top: 1px solid var(--color-outline-variant);
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; gap: 8px;
}
.bottom-bar-top { display: flex; gap: 10px; }
.bottom-bar-main { display: flex; align-items: center; gap: 12px; }
.price-label { font-size: 11px; color: var(--color-secondary); }
.price-row { display: flex; align-items: baseline; }
.price-value { font-size: 24px; font-weight: 600; color: var(--color-primary); margin-right: 4px; }
.price-suffix { font-size: 11px; color: var(--color-secondary); }
.price-wrap { flex: 1; }
.buy-btn {
  background: var(--color-primary); padding: 12px 24px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  flex: 1;
}
.buy-btn.disabled { opacity: 0.5; }
.buy-text { color: #fff; font-size: 18px; font-weight: 600; }
.buy-arrow { color: #fff; font-size: 18px; }

.redeem-btn {
  flex: 1; padding: 10px 16px; border-radius: 10px;
  border: 1px solid var(--color-primary); background: #fff;
  display: flex; align-items: center; justify-content: center;
}
.redeem-btn-text { color: var(--color-primary); font-size: 14px; font-weight: 600; }

.gift-btn {
  flex: 1; padding: 10px 16px; border-radius: 10px;
  border: 1px solid #ca4b00; background: #fff;
  display: flex; align-items: center; justify-content: center;
}
.gift-btn-text { color: #ca4b00; font-size: 14px; font-weight: 600; }



/* 兑换码弹窗 */
.redeem-mask {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}
.redeem-popup {
  width: 85%; max-width: 360px; background: #fff; border-radius: 16px; overflow: hidden;
}
.redeem-popup-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #eee;
}
.redeem-popup-title { font-size: 16px; font-weight: 600; color: var(--color-on-surface); }
.redeem-popup-close { font-size: 18px; color: #999; padding: 4px; }
.redeem-popup-body { padding: 20px; }
.redeem-hint { font-size: 13px; color: var(--color-secondary); display: block; margin-bottom: 12px; }
.redeem-input {
  width: 100%; height: 44px; border: 1px solid var(--color-outline-variant);
  border-radius: 10px; padding: 0 14px; font-size: 16px; letter-spacing: 1px;
  box-sizing: border-box; margin-bottom: 16px;
}
.redeem-confirm-btn {
  width: 100%; height: 44px; background: var(--color-primary); border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 16px; font-weight: 600;
}
.redeem-confirm-btn.disabled { opacity: 0.5; }

/* 礼品码弹窗扩展 */
.gift-tier-list { display: flex; gap: 8px; margin-bottom: 16px; }
.gift-tier-item {
  flex: 1; padding: 10px 8px; border: 1px solid #e0e0e0; border-radius: 8px;
  text-align: center; background: #fafafa;
}
.gift-tier-item.active { border-color: var(--color-primary); background: #f0f5ff; }
.gift-tier-name { font-size: 13px; font-weight: 600; color: var(--color-on-surface); display: block; }
.gift-tier-price { font-size: 11px; color: var(--color-secondary); display: block; margin-top: 2px; }

.gift-qty-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; padding: 0 4px;
}
.gift-qty-label { font-size: 14px; color: var(--color-on-surface); }
.gift-qty-ctrl { display: flex; align-items: center; gap: 12px; }
.qty-btn {
  width: 32px; height: 32px; border-radius: 8px; background: #f0f0f0;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 600; color: #333;
}
.qty-val { font-size: 18px; font-weight: 600; min-width: 24px; text-align: center; }

.gift-total-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; padding: 0 4px;
}
.gift-total-price { font-size: 20px; font-weight: 700; color: #ca4b00; }

.gift-my-codes {
  text-align: center; margin-top: 12px; padding: 8px;
  font-size: 13px; color: var(--color-primary);
}
</style>
