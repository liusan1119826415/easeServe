<template>
  <view class="page-container">
    <!-- Banner -->
    <view class="banner-section">
      <view class="banner-overlay">
        <text class="banner-title">{{ banner.title || '企业一站式服务' }}</text>
        <text class="banner-subtitle">专业、高效、可靠的数字化管理助手</text>
      </view>
      <image class="banner-img" :src="banner.imageUrl || defaultBannerImg" mode="aspectFill" />
    </view>

    <!-- 服务网格 -->
    <view class="service-grid">
      <view class="service-card" v-for="(item, index) in services" :key="index" @tap="navigateTo(item)">
        <view class="service-icon" :style="{ backgroundColor: item.iconBg }">
          <text class="icon-text">{{ item.icon }}</text>
        </view>
        <text class="service-title">{{ item.title }}</text>
        <text class="service-desc">{{ item.desc }}</text>
      </view>
      <!-- 模板下载 - 横跨两列 -->
      <view class="service-card service-card-wide" @tap="navigateTo('/pages/download/index')">
        <view class="service-card-wide-inner">
          <view class="service-icon" style="background-color: var(--color-secondary-container);">
            <text class="icon-text">📥</text>
          </view>
          <view class="service-wide-text">
            <text class="service-title">模板下载</text>
            <text class="service-desc">合同/制度/公文范本</text>
          </view>
          <text class="chevron-icon">›</text>
        </view>
      </view>
    </view>

    <!-- 第三方服务 -->
    <view class="section-header">
      <view class="section-indicator"></view>
      <text class="section-title">第三方服务</text>
    </view>
    <view class="third-party-grid">
      <view class="third-party-item" v-for="(item, index) in thirdPartyServices" :key="index" @tap="openExternal(item.url)">
        <view class="third-party-icon" :style="{ backgroundColor: item.color }">
          <image
            class="third-party-icon-img"
            :src="getIconUrl(item.icon)"
            mode="aspectFit"
          />
        </view>
        <text class="third-party-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <BottomNav :active="0" />

    <!-- 新用户免费咨询弹窗 -->
    <view class="free-consult-mask" v-if="showFreeConsult" @tap.self="closeFreeConsult">
      <view class="free-consult-modal">
        <view class="free-consult-icon">💬</view>
        <text class="free-consult-title">恭喜您！</text>
        <text class="free-consult-desc">作为新用户，您可以立即体验我们免费提供的<text class="highlight">{{ freeConsultDuration }}分钟</text>人工咨询服务，专业顾问在线为您解答。</text>
        <view class="free-consult-btns">
          <view class="btn-secondary" @tap="closeFreeConsult">
            <text class="btn-secondary-text">以后再说</text>
          </view>
          <view class="btn-primary" @tap="claimFreeConsult">
            <text class="btn-primary-text">{{ claiming ? '开启中...' : '立即使用' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getBanners, getCategories, getThirdPartyLinks, getConsultationConfig, claimFreeConsultation } from '@/api/index.js'
import BottomNav from '@/components/BottomNav.vue'

export default {
  components: { BottomNav },
  data() {
    return {
      defaultBannerImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAYovAZpMyqLQLpfn-YxzSJtnZSUJQv7qhsCBdbHic2U4Lp7vAt5qr6BpUmj6iyq79nAug8dfNCqeimzPErsbgBTCp6zCsVf2jvlNuSoGQVxtoi4x0AmOD1pHPVaH8kSPfdPGQ4REZiuOSCqneh6yyH-Ab3xVsn2wIkfFwNgtwsZUeM2bjOpB-a5V2x3sn6tEsIyOI9jmESzeVEl31A7x_oFdQsmyJpMYRu2lH3FMYNfpqDmygzWrEJjDV8pyiM-3d3M-S_7byVXMX',
      banner: {},
      services: [],
      thirdPartyServices: [],
      showFreeConsult: false,
      freeConsultDuration: 10,
      claiming: false
    }
  },
  onLoad(options) {
    this.loadData()
    // 新用户注册后进入首页，触发免费咨询弹窗
    if (options && options.newUser === '1') {
      this.checkFreeConsult()
    }
  },
  methods: {
    async loadData() {
      try {
        // 并行加载首页数据
        const [banners, categories, links] = await Promise.all([
          getBanners(),
          getCategories(),
          getThirdPartyLinks()
        ])

        // 设置轮播图（取第一张）
        if (banners && banners.length > 0) {
          this.banner = banners[0]
        }

        // 映射服务分类到首页网格格式
        if (categories && categories.length > 0) {
          this.services = categories.map(cat => {
            return {
              id: cat.id,
              icon: cat.emoji || '',
              title: cat.name,
              desc: cat.description,
              iconBg: cat.iconBg || 'rgba(0,83,205,0.1)',
              path: cat.path || ''
            }
          })
        }

        // 映射第三方链接
        if (links && links.length > 0) {
          this.thirdPartyServices = links.map(link => ({
            icon: link.icon || 'link',
            name: link.name,
            color: link.iconBgColor || '#e31e24',
            url: link.url || ''
          }))
        }
      } catch (e) {
        console.error('加载首页数据失败:', e)
      }
    },
    navigateTo(item) {
      if (!item) return
      // 兼容字符串（直接路径）和对象（含 path/id）
      let url = typeof item === 'string' ? item : item.path
      if (!url) return
      // 携带分类ID跳转到企业页
      if (typeof item === 'object' && item.id && url.includes('/pages/enterprise/index')) {
        url += (url.includes('?') ? '&' : '?') + 'categoryId=' + item.id
      }
      uni.navigateTo({ url })
    },
    openExternal(url) {
      if (url) {
        // #ifdef H5
        window.open(url)
        // #endif
        // #ifndef H5
        uni.setClipboardData({
          data: url,
          success: () => uni.showToast({ title: '链接已复制', icon: 'none' })
        })
        // #endif
      }
    },
    getIconUrl(iconName) {
      // 如果是 Material Symbols 图标名，使用 Google CDN SVG
      if (iconName && !/^\p{Emoji}/u.test(iconName)) {
        return 'https://fonts.gstatic.com/s/i/materialicons/' + iconName + '/v1/24px.svg'
      }
      return ''
    },

    async checkFreeConsult() {
      try {
        const res = await getConsultationConfig()
        if (res && res.enabled && res.freeMinutesRemaining > 0 && !res.freeConsultationUsed) {
          this.freeConsultDuration = Math.floor(res.freeMinutesRemaining)
          this.showFreeConsult = true
        }
      } catch (e) {
        // 静默失败
      }
    },

    closeFreeConsult() {
      this.showFreeConsult = false
    },

    async claimFreeConsult() {
      if (this.claiming) return
      this.claiming = true
      try {
        const res = await claimFreeConsultation()
        uni.showToast({ title: '咨询已开启', icon: 'success' })
        this.showFreeConsult = false
        // 跳转到咨询页面，传递咨询ID和剩余时间
        const cId = res && res.consultation ? res.consultation.id : ''
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/support-chat/index?consultationId=' + cId })
        }, 1000)
      } catch (e) {
        // 错误已在拦截器中提示
      } finally {
        this.claiming = false
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: var(--margin-page);
  padding-bottom: 120rpx;
  background-color: var(--color-background);
  min-height: 100vh;
}

/* Banner */
.banner-section {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 280rpx;
  margin-bottom: var(--space-lg);
}
.banner-img {
  width: 100%;
  height: 100%;
}
.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-md);
  background: linear-gradient(to right, rgba(0,83,205,0.8), transparent);
}
.banner-title {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-primary);
  margin-bottom: 4px;
}
.banner-subtitle {
  font-size: var(--font-body-md);
  color: rgba(255,255,255,0.9);
}

/* 服务网格 */
.service-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.service-card {
  width: 48%;
  background-color: var(--color-surface-container-low);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 12px;
  box-sizing: border-box;
}
.service-card:active {
  transform: scale(0.98);
}
.service-card-wide {
  width: 100%;
}
.service-card-wide-inner {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.service-wide-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chevron-icon {
  color: var(--color-outline-variant);
  font-size: 24px;
}
.service-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}
.icon-text {
  font-size: 32rpx;
}
.service-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-on-surface);
  line-height: 1.3;
}
.service-desc {
  font-size: var(--font-caption);
  color: var(--color-secondary);
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  margin-bottom: var(--space-sm);
}
.section-indicator {
  width: 6rpx;
  height: 32rpx;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
}
.section-title {
  font-size: var(--font-h2);
  font-weight: 600;
  color: var(--color-on-surface);
}

/* 第三方服务 */
.third-party-grid {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: var(--space-lg);
}
.third-party-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8rpx;
  margin-bottom: 24rpx;
}
.third-party-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}
.third-party-icon-img {
  width: 40rpx;
  height: 40rpx;
}
.third-party-name {
  font-size: var(--font-caption);
  color: var(--color-on-surface-variant);
  line-height: 1.3;
}

/* ===== 新用户免费咨询弹窗 ===== */
.free-consult-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.free-consult-modal {
  width: 80%; max-width: 600rpx;
  background: #fff; border-radius: 24rpx;
  padding: 48rpx 40rpx 36rpx;
  display: flex; flex-direction: column; align-items: center;
  box-shadow: 0 16rpx 48rpx rgba(0,0,0,0.15);
}
.free-consult-icon {
  width: 96rpx; height: 96rpx; border-radius: 50%;
  background: rgba(0,83,205,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 48rpx; margin-bottom: 24rpx;
}
.free-consult-title {
  font-size: 38rpx; font-weight: 700; color: #1a1a1a;
  margin-bottom: 16rpx;
}
.free-consult-desc {
  font-size: 28rpx; color: #666; line-height: 1.7;
  text-align: center; margin-bottom: 40rpx;
}
.free-consult-desc .highlight {
  color: var(--color-primary, #0053cd); font-weight: 700;
  font-size: 32rpx;
}
.free-consult-btns {
  display: flex; gap: 20rpx; width: 100%;
}
.btn-secondary {
  flex: 1; height: 80rpx; border-radius: 40rpx;
  border: 1px solid #ddd; background: #fff;
  display: flex; align-items: center; justify-content: center;
}
.btn-secondary-text { font-size: 28rpx; color: #666; }
.btn-primary {
  flex: 1; height: 80rpx; border-radius: 40rpx;
  background: var(--color-primary, #0053cd);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0,83,205,0.3);
}
.btn-primary-text { font-size: 28rpx; color: #fff; font-weight: 600; }
</style>
