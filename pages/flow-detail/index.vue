<template>
  <view class="page-container" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <!-- 全屏步骤内容区 - 卡片式布局 -->
    <scroll-view
      class="scroll-body"
      scroll-y
      :scroll-top="scrollTop"
    >
      <!-- 步骤卡片列表 -->
      <view
        v-for="(step, idx) in steps"
        :key="idx"
        class="step-card"
        :class="{ 'step-card-active': idx === currentIndex, 'step-card-inactive': idx !== currentIndex }"
      >
        <!-- 步骤头部：编号 + 标题 + 指引按钮 -->
        <view class="step-card-header">
          <view class="step-card-left">
            <text class="step-card-num">{{ padZero(idx + 1) }}</text>
            <text class="step-card-title">{{ stepContents[idx] && stepContents[idx].title ? stepContents[idx].title : step.name }}</text>
          </view>
          <view
            v-if="stepContents[idx] && stepContents[idx].hasDetailGuide && idx === currentIndex && stepContents[idx].unlocked"
            class="guide-btn"
            @tap="openGuideModal(idx)"
          >
            <text class="guide-btn-text">详情指引</text>
            <text class="guide-btn-icon">ⓘ</text>
          </view>
          <view
            v-else-if="stepContents[idx] && stepContents[idx].hasDetailGuide && idx === currentIndex"
            class="guide-btn guide-btn-locked"
            @tap="onGuideLocked"
          >
            <text class="guide-btn-text">详情指引</text>
            <text class="guide-btn-icon">🔒</text>
          </view>
          <view
            v-else-if="stepContents[idx] && stepContents[idx].hasDetailGuide"
            class="guide-btn guide-btn-disabled"
          >
            <text class="guide-btn-text">详情指引</text>
            <text class="guide-btn-icon">🔒</text>
          </view>
        </view>

        <!-- 描述文本 -->
        <text
          v-if="stepContents[idx] && stepContents[idx].description"
          class="step-desc"
        >{{ stepContents[idx].description }}</text>

        <!-- 标签行 -->
        <view v-if="getStepTags(idx).length > 0" class="step-tags">
          <text v-for="(tag, i) in getStepTags(idx)" :key="i" class="tag-pill" :class="i % 2 === 0 ? 'tag-pill-blue' : 'tag-pill-orange'">{{ tag }}</text>
        </view>

        <!-- 付费锁定提示 -->
        <!-- <view v-if="isStepLocked(idx)" class="locked-card-inline">
          <text class="locked-icon-small">🔒</text>
          <text class="locked-desc-small">购买后可查看完整内容</text>
          <text class="locked-price">¥{{ stepContents[idx].price }}</text>
        </view> -->

        <!-- 每卡片底部导航（参考Mockup：返回 / 上一步 / 下一步） -->
        <view class="step-card-nav">
          <view class="nav-btn" @tap="goBack()">
            <text>返回</text>
          </view>
          <view v-if="idx > 0" class="nav-btn" @tap="switchStep(idx - 1)">
            <text>上一步</text>
          </view>
          <view
            v-if="idx < steps.length - 1"
            class="nav-btn nav-btn-primary"
            @tap="switchStep(idx + 1)"
          >
            <text>下一步</text>
          </view>
        </view>
      </view>

      <!-- 无内容时 -->
      <view v-if="!loading && steps.length === 0" class="content-area">
        <view class="empty-content">
          <text class="empty-icon">📭</text>
          <text class="empty-text">暂无详细内容</text>
        </view>
      </view>

      <!-- 相关链接 -->
      <view v-if="currentRelatedLinks.length > 0" class="related-section">
        <view class="related-header">
          <view class="related-accent"></view>
          <text class="related-title">相关链接</text>
        </view>
        <view
          v-for="(link, li) in currentRelatedLinks"
          :key="li"
          class="related-card"
          @tap="goRelatedLink(link)"
        >
          <view class="related-card-inner">
            <text class="related-link-text">
              相关链接 &gt;&gt;
              <text class="related-highlight">{{ link.label }}</text>
            </text>
            <text class="related-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 信任指标 -->
      <!-- <view class="trust-bar">
        <view class="trust-item">
          <text class="trust-value primary-text">{{ stats.satisfaction }}</text>
          <text class="trust-label">用户好评度</text>
        </view>
        <view class="trust-item">
          <text class="trust-value">{{ stats.subscribedLabel }}</text>
          <text class="trust-label">已订阅企业</text>
        </view>
        <view class="trust-item trust-last">
          <text class="trust-value">{{ stats.version }}</text>
          <text class="trust-label">更新版本</text>
        </view>
      </view> -->

      <!-- 底部安全间距，确保内容不被底部栏遮挡 -->
      <view style="height: 180rpx;"></view>
    </scroll-view>

    <!-- 底部栏：收藏 + 联系顾问 + 解锁流程 -->
    <view class="bottom-bar safe-area-bottom">
      <view class="fav-btn" :class="{ 'fav-btn-favorited': isFavorited }" @tap="toggleFavorite">
        <text class="fav-btn-icon">{{ isFavorited ? '♥' : '♡' }}</text>
        <text class="fav-btn-label">收藏</text>
      </view>
      <view class="contact-btn" @tap="goContact">
        <text>🎧 联系顾问</text>
      </view>
      <view v-if="isAnyStepLocked" class="unlock-btn" @tap="handlePayForCurrent">
        <text>{{ currentPriceLabel || '解锁完整流程' }}</text>
      </view>
    </view>

    <!-- 详情指引弹窗（参考Mockup底部弹出面板） -->
    <view v-if="guideModalVisible" class="guide-modal-mask" @tap="closeGuideModal">
      <view class="guide-modal-sheet" @tap.stop>
        <view class="guide-modal-header">
          <text class="guide-modal-title">详情指引</text>
          <view class="guide-modal-close" @tap="closeGuideModal">
            <text class="guide-modal-close-icon">✕</text>
          </view>
        </view>
        <scroll-view class="guide-modal-body" scroll-y>
          <view class="guide-modal-content">
            <text class="guide-modal-section-title">操作要点说明</text>
            <rich-text
              v-if="guideModalStep"
              :nodes="guideModalStep.detailGuide"
              class="guide-modal-rich"
            />
          </view>
        </scroll-view>
        <view class="guide-modal-footer">
          <view class="guide-modal-btn" @tap="closeGuideModal">
            <text>我知道了</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getStepNavigation, getCategoryContents, getCategoryContentDetail, createOrder, invokePayment, getPlatformStats, addFavorite, removeFavorite, getFavorites } from '@/api/index.js'

export default {
  data() {
    return {
      // 步骤导航
      steps: [],
      currentIndex: 0,
      parent: {},

      // 所有步骤的内容（与 steps 数组索引对应）
      stepContents: [],

      // 详情指引弹窗
      guideModalVisible: false,
      guideModalStepIndex: -1,

      // 当前步骤关联模块
      currentRelatedLinks: [],

      // 收藏状态
      contentId: 0,
      isFavorited: false,

      // 加载状态
      loading: true,

      // 滑动切换
      touchStartY: 0,
      touchStartTime: 0,
      scrollTop: 0,
      swipeCooldown: false,

      // 统计
      stats: {
        satisfaction: '4.8',
        subscribedLabel: '0',
        version: 'V2.4'
      }
    }
  },
  computed: {
    currentStepName() {
      if (this.steps.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.steps.length) {
        const c = this.stepContents[this.currentIndex]
        return (c && c.title) || this.steps[this.currentIndex].name || '流程详情'
      }
      return '流程详情'
    },
    isAnyStepLocked() {
      return this.stepContents.some(c => c && c.price > 0 && !c.unlocked)
    },
    currentPriceLabel() {
      const c = this.stepContents[this.currentIndex]
      if (c && c.price > 0) {
        return c.priceLabel || ('💰 付费查看完整流程 ¥' + c.price)
      }
      return '💰 付费查看完整流程'
    },
    guideModalStep() {
      if (this.guideModalStepIndex >= 0 && this.guideModalStepIndex < this.stepContents.length) {
        return this.stepContents[this.guideModalStepIndex]
      }
      return null
    }
  },
  onLoad(options) {
    const contentId = parseInt(options.contentId) || 0
    if (contentId) {
      this.loadFromContent(contentId)
    }
    this.loadStats()
  },
  methods: {
    /** 补零显示步骤编号 */
    padZero(num) {
      return num < 10 ? '0' + num : '' + num
    },

    /** 获取步骤标签 */
    getStepTags(idx) {
      const c = this.stepContents[idx]
      if (!c || !c.tags) return []
      const raw = c.tags.trim()
      if (!raw) return []
      return raw.split(',').map(t => t.trim()).filter(t => t)
    },

    /** 步骤是否付费锁定 */
    isStepLocked(idx) {
      const c = this.stepContents[idx]
      if (!c) return false
      return c.price > 0 && !c.unlocked
    },

    /** 通过内容ID直接加载：解析 content 的 steps JSON 生成步骤卡片 */
    async loadFromContent(contentId) {
      try {
        const detail = await getCategoryContentDetail(contentId)
        console.log('[flow-detail] loadFromContent detail:', JSON.stringify({ id: detail.id, serviceType: detail.serviceType, hasSteps: !!detail.steps, price: detail.price }))
        if (!detail) {
          this.loading = false
          return
        }

        // 检查是否需要登录（survey类型未登录时返回 authRequired）
        if (detail.authRequired) {
          uni.showToast({ title: detail.message || '请先登录', icon: 'none' })
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/flow-detail/index?contentId=' + contentId) })
          }, 1500)
          this.loading = false
          return
        }

        // survey 类型重定向到问卷页
        if (detail.serviceType === 'survey') {
          uni.redirectTo({ url: '/pages/survey/index?contentId=' + detail.id })
          return
        }

        this.contentId = detail.id
        this.isFavorited = !!detail.isFavorited

        const topPrice = Number(detail.price) || 0
        const topPriceLabel = detail.priceLabel || ''
        const unlocked = !!detail.unlocked || topPrice === 0
        const relatedLinks = detail.relatedLinks || ''
        const newStepContents = []
        const newSteps = []

        // 解析 steps JSON 展开为独立卡片
        if (detail.steps) {
          try {
            const parsedSteps = JSON.parse(detail.steps)
            console.log('[flow-detail] 解析后 steps 数量:', Array.isArray(parsedSteps) ? parsedSteps.length : '非数组')
            if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
              for (let j = 0; j < parsedSteps.length; j++) {
                const ps = parsedSteps[j]
                newStepContents.push({
                  id: detail.id,
                  title: ps.title || '',
                  description: ps.description || '',
                  coverImage: ps.coverImage || '',
                  detailGuide: ps.detailGuide || '',
                  hasDetailGuide: !!ps.hasDetailGuide,
                  tags: ps.tags || '',
                  price: topPrice,
                  priceLabel: topPriceLabel,
                  unlocked: unlocked,
                  relatedLinks: relatedLinks
                })
                newSteps.push({ id: detail.id, name: ps.title || '' })
              }
            }
          } catch (e) {
            console.error('解析 steps JSON 失败:', e)
          }
        }

        // 兜底：无有效 steps 时用 content 自身作为单张卡片
        if (newStepContents.length === 0) {
          newStepContents.push({
            id: detail.id,
            title: detail.title || '',
            description: '',
            price: topPrice,
            priceLabel: topPriceLabel,
            unlocked: unlocked,
            tags: '',
            detailGuide: '',
            hasDetailGuide: false,
            relatedLinks: relatedLinks
          })
          newSteps.push({ id: detail.id, name: detail.title || '' })
        }

        this.stepContents = newStepContents
        this.steps = newSteps
        this.currentIndex = 0
        console.log('[flow-detail] 最终 stepContents 数量:', newStepContents.length)
        this.updateCurrentRelatedLinks()
      } catch (e) {
        console.error('通过内容ID加载失败:', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    /** 加载步骤导航信息 */
    async loadSteps(categoryId) {
      try {
        const res = await getStepNavigation(categoryId)
        console.log('[flow-detail] getStepNavigation 返回:', JSON.stringify(res))
        if (res) {
          this.steps = res.steps || []
          this.currentIndex = res.currentIndex >= 0 ? res.currentIndex : 0
          this.parent = res.parent || {}
          console.log('[flow-detail] steps 数量:', this.steps.length, 'currentIndex:', this.currentIndex)

          // 加载所有步骤的内容
          await this.loadAllStepContents()
        } else {
          console.log('[flow-detail] getStepNavigation 返回空 res')
        }
      } catch (e) {
        console.error('加载步骤导航失败:', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    /** 加载所有步骤的内容（每个L3分类一条记录，steps JSON展开为独立卡片） */
    async loadAllStepContents() {
      const newStepContents = []
      const newSteps = []

      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i]
        console.log('[flow-detail] 处理步骤 i=' + i + ', step.id=' + step.id + ', step.name=' + step.name)
        try {
          const res = await getCategoryContents(step.id)
          console.log('[flow-detail] getCategoryContents(' + step.id + ') 返回:', JSON.stringify({ hasContents: !!(res && res.contents), contentsLen: res && res.contents ? res.contents.length : 0 }))
          if (res && res.contents && res.contents.length > 0) {
            const content = res.contents[0]
            console.log('[flow-detail] content:', JSON.stringify({ id: content.id, title: content.title, serviceType: content.serviceType, hasSteps: !!content.steps, price: content.price }))

            // 问卷类型 → 跳过，继续渲染其他 flow 步骤
            if (content.serviceType === 'survey') {
              console.log('[flow-detail] 跳过 survey 类型步骤')
              continue
            }

            // 获取详情（解锁状态 + 关联模块）
            let detail = null
            try {
              detail = await getCategoryContentDetail(content.id)
            } catch (e) { /* ignore */ }

            const topPrice = detail ? Number(detail.price) || 0 : Number(content.price) || 0
            const topPriceLabel = detail ? detail.priceLabel || '' : content.priceLabel || ''
            const unlocked = detail ? !!detail.unlocked : (topPrice === 0)
            const relatedLinks = detail ? detail.relatedLinks || '' : ''

            // 解析 steps JSON 展开为独立卡片
            if (content.steps) {
              console.log('[flow-detail] content.steps 原始值:', content.steps.substring(0, 200))
              try {
                const parsedSteps = JSON.parse(content.steps)
                console.log('[flow-detail] 解析后 steps 数量:', Array.isArray(parsedSteps) ? parsedSteps.length : '非数组')
                if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
                  for (let j = 0; j < parsedSteps.length; j++) {
                    const ps = parsedSteps[j]
                    newStepContents.push({
                      id: content.id,
                      title: ps.title || step.name || '',
                      description: ps.description || '',
                      coverImage: ps.coverImage || '',
                      detailGuide: ps.detailGuide || '',
                      hasDetailGuide: !!ps.hasDetailGuide,
                      tags: ps.tags || '',
                      price: topPrice,
                      priceLabel: topPriceLabel,
                      unlocked: unlocked || topPrice === 0,
                      relatedLinks: relatedLinks
                    })
                    newSteps.push({ id: step.id, name: ps.title || step.name || '' })
                  }
                } else {
                  // steps 为空数组，用 content 自身作为兜底
                  newStepContents.push({
                    id: content.id,
                    title: content.title || step.name || '',
                    description: '',
                    price: topPrice,
                    priceLabel: topPriceLabel,
                    unlocked: unlocked || topPrice === 0,
                    tags: '',
                    detailGuide: '',
                    hasDetailGuide: false,
                    relatedLinks: relatedLinks
                  })
                  newSteps.push({ id: step.id, name: content.title || step.name || '' })
                }
              } catch (e) {
                // JSON 解析失败，兜底
                newStepContents.push({
                  id: content.id,
                  title: content.title || step.name || '',
                  description: '',
                  price: topPrice,
                  priceLabel: topPriceLabel,
                  unlocked: unlocked || topPrice === 0,
                  tags: '',
                  detailGuide: '',
                  hasDetailGuide: false,
                  relatedLinks: relatedLinks
                })
                newSteps.push({ id: step.id, name: content.title || step.name || '' })
              }
            } else {
              // 无 steps 字段（兼容旧数据）
              newStepContents.push({
                id: content.id,
                title: content.title || step.name || '',
                description: content.description || '',
                coverImage: content.coverImage || '',
                detailGuide: '',
                hasDetailGuide: false,
                price: topPrice,
                priceLabel: topPriceLabel,
                unlocked: unlocked || topPrice === 0,
                tags: content.tags || '',
                relatedLinks: relatedLinks
              })
              newSteps.push({ id: step.id, name: content.title || step.name || '' })
            }
          } else {
            // 该分类下无内容时，用分类名作为兜底卡片
            newStepContents.push({
              title: step.name || '',
              description: '',
              price: 0,
              unlocked: true,
              tags: '',
              detailGuide: '',
              hasDetailGuide: false,
              relatedLinks: ''
            })
            newSteps.push({ id: step.id, name: step.name || '' })
          }
        } catch (e) {
          console.error('加载步骤内容失败 idx=' + i + ':', e)
          newStepContents.push({ title: step.name || '', description: '', price: 0, unlocked: true, tags: '', hasDetailGuide: false })
          newSteps.push({ id: step.id, name: step.name || '' })
        }
      }

      this.stepContents = newStepContents
      this.steps = newSteps
      console.log('[flow-detail] 最终 stepContents 数量:', newStepContents.length, 'steps 数量:', newSteps.length)
      // 设置当前步骤的关联模块
      this.updateCurrentRelatedLinks()
    },

    /** 打开详情指引弹窗 */
    openGuideModal(idx) {
      const c = this.stepContents[idx]
      if (!c || !c.unlocked) return
      this.guideModalStepIndex = idx
      this.guideModalVisible = true
    },

    /** 未付费/非VIP用户点击锁定的详情指引 */
    onGuideLocked() {
      const c = this.stepContents[this.currentIndex]
      if (c && c.price > 0) {
        uni.showToast({ title: '请先购买后查看', icon: 'none' })
      } else {
        uni.showToast({ title: '请先登录后查看', icon: 'none' })
      }
    },

    /** 关闭详情指引弹窗 */
    closeGuideModal() {
      this.guideModalVisible = false
      this.guideModalStepIndex = -1
    },

    /** 更新当前步骤的关联模块 */
    updateCurrentRelatedLinks() {
      const c = this.stepContents[this.currentIndex]
      if (c && c.relatedLinks) {
        try {
          this.currentRelatedLinks = JSON.parse(c.relatedLinks)
        } catch {
          this.currentRelatedLinks = []
        }
      } else {
        this.currentRelatedLinks = []
      }
    },

    /** 切换到指定步骤 */
    async switchStep(index) {
      if (index < 0 || index >= this.steps.length) return
      if (index === this.currentIndex) return

      this.currentIndex = index
      // 不通过 scrollTop 强制滚顶，避免 scroll-view 滚动动画吞掉按钮 tap 事件
      this.updateCurrentRelatedLinks()
    },

    /** 下载文件（已废弃，新数据模型不再支持文件类型） */
    downloadFileForStep() {
      uni.showToast({ title: '该功能已不再支持', icon: 'none' })
    },

    /** 上一步 */
    goPrev() {
      if (this.currentIndex <= 0) return
      this.switchStep(this.currentIndex - 1)
    },

    /** 下一步 */
    goNext() {
      if (this.currentIndex >= this.steps.length - 1) return
      this.switchStep(this.currentIndex + 1)
    },

    /** 返回上一页 */
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
      } else {
        // switchTab 仅对 tabBar 页面有效，用 reLaunch 兜底
        uni.reLaunch({ url: '/pages/index/index' })
      }
    },

    /** 收藏/取消收藏 */
    async toggleFavorite() {
      if (!this.contentId) return
      // 未登录跳转登录页
      const token = uni.getStorageSync('token')
      if (!token) {
        const redirectUrl = '/pages/flow-detail/index?contentId=' + this.contentId
        uni.redirectTo({
          url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl),
          fail: () => uni.reLaunch({ url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl) })
        })
        return
      }
      try {
        if (this.isFavorited) {
          // 取消收藏：需要先找到收藏记录ID
          const favs = await getFavorites(1, 100)
          const list = favs.list || favs.records || []
          const fav = list.find(f => f.contentId === this.contentId)
          if (fav) {
            await removeFavorite(fav.id)
            this.isFavorited = false
            uni.showToast({ title: '已取消收藏', icon: 'none' })
          }
        } else {
          await addFavorite({ contentId: this.contentId })
          this.isFavorited = true
          uni.showToast({ title: '收藏成功', icon: 'none' })
        }
      } catch (e) {
        console.error('收藏操作失败:', e)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    /** 触摸开始 */
    onTouchStart(e) {
      this.touchStartY = e.touches[0].clientY
      this.touchStartTime = Date.now()
    },

    /** 触摸结束（滑动切换步骤） */
    onTouchEnd(e) {
      if (this.swipeCooldown) return

      const touchEndY = e.changedTouches[0].clientY
      const deltaY = touchEndY - this.touchStartY
      const deltaTime = Date.now() - this.touchStartTime

      if (Math.abs(deltaY) < 60 || deltaTime > 500) return

      // 上滑 → 下一步
      if (deltaY < -60) {
        if (this.currentIndex < this.steps.length - 1) {
          this.startSwipeCooldown()
          this.goNext()
        }
      }
      // 下滑 → 上一步
      else if (deltaY > 60) {
        if (this.currentIndex > 0) {
          this.startSwipeCooldown()
          this.goPrev()
        }
      }
    },

    onScrollToUpper() {},
    onScrollToLower() {},

    startSwipeCooldown() {
      this.swipeCooldown = true
      setTimeout(() => {
        this.swipeCooldown = false
      }, 600)
    },

    /** 跳转关联模块 */
    async goRelatedLink(link) {
      if (!link.targetCategoryId) return
      // 检查目标分类的服务类型
      try {
        const res = await getCategoryContents(link.targetCategoryId)
        if (res && res.contents && res.contents.length > 0) {
          const firstContent = res.contents[0]
          if (firstContent.serviceType === 'survey') {
            uni.navigateTo({
              url: '/pages/survey/index?contentId=' + firstContent.id
            })
            return
          }
          // flow 类型：使用内容ID导航
          uni.navigateTo({
            url: '/pages/flow-detail/index?contentId=' + firstContent.id
          })
          return
        }
      } catch (e) {
        console.error('检查关联模块服务类型失败:', e)
      }
      // 兜底：跳转到 service-detail 列表页
      uni.navigateTo({
        url: '/pages/service-detail/index?categoryId=' + link.targetCategoryId
      })
    },

    /** 付费购买（当前步骤） */
    async handlePayForCurrent() {
      const c = this.stepContents[this.currentIndex]
      if (!c) return

      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          const cur = getCurrentPages().pop()
          const stepId = this.steps.length > 0 && this.currentIndex >= 0 ? this.steps[this.currentIndex].id : 0
          uni.navigateTo({ url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/flow-detail/index?contentId=' + stepId) })
        }, 1500)
        return
      }

      const itemId = c.id || 0
      const itemTitle = c.title || this.currentStepName || '内容'

      try {
        const orderData = {
          orderType: 1,
          title: '购买: ' + itemTitle,
          amount: c.price,
          items: [{
            itemType: 4,
            itemId: itemId,
            name: itemTitle,
            price: c.price,
            quantity: 1
          }]
        }

        uni.showLoading({ title: '创建订单...' })
        const orderRes = await createOrder(orderData)

        uni.showLoading({ title: '支付中...' })
        await invokePayment(orderRes.orderId)

        uni.hideLoading()
        uni.showToast({ title: '购买成功', icon: 'success' })

        // 重新加载所有共享同一 content ID 的步骤卡片
        const purchasedContentId = this.stepContents.length > this.currentIndex && this.currentIndex >= 0
          ? (this.stepContents[this.currentIndex] && this.stepContents[this.currentIndex].id) : 0
        if (purchasedContentId) {
          try {
            const detail = await getCategoryContentDetail(purchasedContentId)
            if (detail) {
              const newPrice = Number(detail.price) || 0
              const newUnlocked = !!detail.unlocked
              const newRelatedLinks = detail.relatedLinks || ''
              // 刷新所有共享此 content ID 的卡片
              for (let i = 0; i < this.stepContents.length; i++) {
                if (this.stepContents[i] && this.stepContents[i].id === purchasedContentId) {
                  this.$set(this.stepContents, i, {
                    ...this.stepContents[i],
                    price: newPrice,
                    unlocked: newUnlocked,
                    relatedLinks: newRelatedLinks
                  })
                }
              }
              this.updateCurrentRelatedLinks()
            }
          } catch (e) {
            console.error('刷新内容失败:', e)
          }
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '支付失败: ' + (e.message || ''), icon: 'none' })
      }
    },

    goContact() {
      // 未登录跳转登录页
      const token = uni.getStorageSync('token')
      if (!token) {
        const redirectUrl = '/pages/flow-detail/index?contentId=' + this.contentId
        uni.redirectTo({
          url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl),
          fail: () => uni.reLaunch({ url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl) })
        })
        return
      }
      uni.navigateTo({ url: '/pages/select-support/index' })
    },

    /** 加载平台统计 */
    async loadStats() {
      try {
        const res = await getPlatformStats()
        if (res) {
          const count = Number(res.subscribedCount) || 0
          this.stats = {
            satisfaction: (Number(res.satisfaction) || 4.8).toFixed(1),
            subscribedLabel: count >= 1000 ? Math.floor(count / 1000) + ',' + String(count % 1000).padStart(3, '0') + '+' : count + '+',
            version: res.version || 'V2.4'
          }
        }
      } catch (e) {
        // 静默失败
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-background);
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 滚动区 */
.scroll-body {
  width: 100%;
  height: calc(100vh - 130rpx - env(safe-area-inset-bottom));
}

/* ========== 步骤卡片（对齐Mockup: p-5=40rpx内边距, space-y-6=48rpx, px-page-margin=32rpx） ========== */
.step-card {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #fff;
  border: 2rpx solid var(--color-outline-variant);
  border-radius: var(--radius-xl);
  padding: 40rpx;
  margin: 0 32rpx 40rpx 32rpx;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.step-card-active {
  border-color: #1E6FFF;
  box-shadow: 0 12px 24px -8px rgba(30, 111, 255, 0.15);
}
.step-card-inactive {
  opacity: 0.6;
  filter: grayscale(0.5);
}

/* 卡片头部（Mockup: mb-4=32rpx） */
.step-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
}
.step-card-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.step-card-num {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-secondary);
  opacity: 0.2;
  line-height: 1;
  margin-bottom: 6rpx;
}
.step-card-active .step-card-num {
  color: var(--color-primary);
  opacity: 0.3;
}
.step-card-title {
  font-size: var(--font-h2);
  font-weight: 600;
  color: var(--color-on-surface);
}

/* 描述文本（Mockup: mb-8≈48rpx） */
.step-desc {
  font-size: var(--font-body-md);
  color: var(--color-on-surface-variant);
  line-height: 1.7;
  margin-bottom: 48rpx;
  display: block;
}

/* 详情指引按钮（参考Mockup: bg-primary/10 rounded-full shadow-sm） */
.guide-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 20rpx;
  border-radius: var(--radius-full);
  background: rgba(30, 111, 255, 0.1);
  flex-shrink: 0;
  margin-left: 12rpx;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.guide-btn:active {
  background: rgba(30, 111, 255, 0.2);
  transform: scale(0.95);
}
.guide-btn-text {
  font-size: 22rpx;
  color: #1E6FFF;
  font-weight: 600;
}
.guide-btn-icon {
  font-size: 22rpx;
  color: #1E6FFF;
}

/* 非活跃卡指引按钮（参考Mockup: bg-secondary-container opacity-50 lock图标） */
.guide-btn-disabled {
  background: #dfe2ea;
  box-shadow: none;
  pointer-events: none;
}
.guide-btn-disabled .guide-btn-text {
  color: #5b5f65;
  opacity: 0.5;
}
.guide-btn-disabled .guide-btn-icon {
  color: #5b5f65;
  opacity: 0.5;
}

/* 当前步骤锁定指引按钮（未付费/非VIP，可点击但不可打开） */
.guide-btn-locked {
  background: #e8eaef;
  box-shadow: none;
}
.guide-btn-locked .guide-btn-text {
  color: #8a8d95;
}
.guide-btn-locked .guide-btn-icon {
  color: #8a8d95;
}
.guide-btn-locked:active {
  background: #dfe2ea;
  transform: scale(0.97);
}

/* ========== 详情指引弹窗（参考Mockup底部滑出面板） ========== */
.guide-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
}
.guide-modal-mask::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
.guide-modal-sheet {
  position: relative;
  width: 100%;
  max-height: 70vh;
  background: #faf9f9;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: guideSlideUp 0.3s ease-out;
}
@keyframes guideSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.guide-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 16rpx;
  flex-shrink: 0;
}
.guide-modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1b1c1c;
}
.guide-modal-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #efeded;
  transition: background 0.2s;
}
.guide-modal-close:active {
  background: #e9e8e8;
}
.guide-modal-close-icon {
  font-size: 28rpx;
  color: #5b5f65;
  font-weight: 700;
}
.guide-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 32rpx 24rpx;
}
.guide-modal-image {
  width: 100%;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  background: #e9e8e8;
}
.guide-modal-content {
  padding: 0;
}
.guide-modal-section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1b1c1c;
  margin-bottom: 16rpx;
  display: block;
}
.guide-modal-rich {
  font-size: 28rpx;
  color: #424655;
  line-height: 1.8;
}
.guide-modal-footer {
  flex-shrink: 0;
  padding: 16rpx 32rpx 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}
.guide-modal-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1E6FFF;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 2px 8px rgba(30, 111, 255, 0.3);
  transition: transform 0.15s;
}
.guide-modal-btn:active {
  transform: scale(0.97);
}

/* 步骤标签 */
.step-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: 16rpx;
}
.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: var(--radius-full);
  font-size: var(--font-label-sm);
  font-weight: 500;
  line-height: 1.4;
}
.tag-pill-blue {
  background: rgba(0,83,205,0.1);
  color: var(--color-primary);
}
.tag-pill-orange {
  background: rgba(161,59,0,0.1);
  color: var(--color-tertiary);
}

/* 卡片内付费锁定 */
.locked-card-inline {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, rgba(0,83,205,0.04), rgba(0,83,205,0.08));
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-outline-variant);
  margin-bottom: 16rpx;
}
.locked-icon-small {
  font-size: 32rpx;
}
.locked-desc-small {
  flex: 1;
  font-size: var(--font-caption);
  color: var(--color-secondary);
}
.locked-price {
  font-size: var(--font-body-md);
  font-weight: 700;
  color: var(--color-primary);
}

/* 文件卡片 */
.file-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: var(--color-primary-container);
  border-radius: var(--radius-lg);
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.file-icon-wrap {
  width: 80rpx; height: 80rpx;
  border-radius: 16rpx;
  background: rgba(0,83,205,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.file-icon { font-size: 36rpx; }
.file-info { flex: 1; }
.file-name {
  font-size: var(--font-body-md);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
  margin-bottom: 4rpx;
}
.file-hint {
  font-size: var(--font-caption);
  color: var(--color-secondary);
}
.file-arrow {
  font-size: 28rpx;
  color: var(--color-primary);
  font-weight: 700;
}

/* 卡片底部导航 */
.step-card-nav {
  display: flex;
  align-items: center;
  gap: 12rpx;
  border-top: 1px solid var(--color-surface-variant);
  padding-top: 20rpx;
  margin-top: 8rpx;
}
.nav-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  font-size: var(--font-body-md);
  font-weight: 600;
  color: var(--color-secondary);
  transition: all 0.2s;
}
.nav-btn:active {
  background: var(--color-surface-container);
}
.nav-btn-primary {
  flex: 2;
  border: none;
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,83,205,0.3);
}
.nav-btn-primary:active {
  transform: scale(0.97);
}

/* 非活跃卡底部按钮灰化（参考Mockup: text-secondary/40 bg-secondary） */
.step-card-inactive .nav-btn {
  color: rgba(91, 95, 101, 0.4);
  border-color: rgba(114, 119, 135, 0.4);
}
.step-card-inactive .nav-btn-primary {
  background: #5b5f65;
  color: rgba(255, 255, 255, 0.6);
  box-shadow: none;
}

/* 空状态 */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}
.empty-icon { font-size: 64rpx; margin-bottom: 16rpx; }
.empty-text { font-size: var(--font-body-md); color: var(--color-secondary); }

/* 相关链接 */
.related-section {
  margin: 0 32rpx 40rpx 32rpx;
}
.related-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: 16rpx;
}
.related-accent {
  width: 4rpx;
  height: 36rpx;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}
.related-title {
  font-size: var(--font-h2);
  font-weight: 600;
  color: var(--color-on-surface);
}
.related-card {
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-xl);
  padding: 32rpx;
  margin-bottom: 16rpx;
  transition: background 0.2s;
}
.related-card:active {
  background: var(--color-surface-container-high);
}
.related-card-inner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}
.related-link-text {
  flex: 1;
  font-size: var(--font-body-md);
  font-weight: 500;
  color: var(--color-on-surface);
  line-height: 1.6;
}
.related-highlight {
  font-size: var(--font-body-md);
  font-weight: 500;
  color: #ffffff;
  background: #ff6b00;
  padding: 2rpx 8rpx;
  border-radius: var(--radius-sm);
  line-height: 1.6;
}
.related-arrow {
  font-size: 36rpx;
  color: rgba(114, 119, 135, 0.4);
  font-weight: 600;
  flex-shrink: 0;
}

/* 信任指标 */
.trust-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-outline-variant);
  margin-top: var(--space-md);
}
.trust-item {
  flex: 1;
  text-align: center;
  border-right: 1px solid var(--color-outline-variant);
  padding: 0 8rpx;
}
.trust-last { border-right: none; }
.trust-value {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
}
.primary-text { color: var(--color-primary); }
.trust-label {
  font-size: var(--font-caption);
  color: var(--color-secondary);
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background-color: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(8px);
  border-top: 1px solid #e3e2e2;
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.05);
}
.fav-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4rpx; padding: 12rpx 16rpx; flex-shrink: 0;
}
.fav-btn-icon {
  font-size: 52rpx; color: #999; line-height: 1; width: 56rpx; text-align: center;
}
.fav-btn-label {
  font-size: 24rpx; color: #999; font-weight: 500;
}
.fav-btn-favorited .fav-btn-icon,
.fav-btn-favorited .fav-btn-label {
  color: #ba1a1a;
}
.contact-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-xl);
  font-size: var(--font-body-md);
  font-weight: 600;
  color: var(--color-primary);
  gap: 8rpx;
  transition: background 0.2s;
}
.contact-btn:active {
  background: rgba(0,83,205,0.05);
}
.unlock-btn {
  flex: 2;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border-radius: var(--radius-xl);
  font-size: var(--font-body-md);
  font-weight: 600;
  color: #fff;
  gap: 8rpx;
  box-shadow: 0 2px 8px rgba(0,83,205,0.3);
  transition: transform 0.15s;
}
.unlock-btn:active {
  transform: scale(0.97);
}

</style>
