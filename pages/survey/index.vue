<template>
  <view class="page-container">
    <template v-if="loading">
      <view class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
    </template>

    <template v-else-if="questionnaire">
      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-info">
          <text class="progress-text">第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题</text>
          <text class="progress-percent">完成度 {{ percent }}%</text>
        </view>
        <view class="progress-bar-bg">
          <view class="progress-bar-fill" :style="{ width: percent + '%' }"></view>
        </view>
      </view>

      <!-- 当前题目 -->
      <view v-if="currentQuestion" class="question-section">
        <text class="question-title">Q{{ currentIndex + 1 }}. {{ currentQuestion.title }}</text>

        <!-- 选项列表 -->
        <view class="options-wrap">
          <view
            v-for="opt in currentQuestion.options"
            :key="opt.id"
            class="option-item"
            :class="{ 'option-selected': isOptionSelected(currentQuestion.id, opt.id) }"
            @tap="handleOptionTap(currentQuestion, opt)"
          >
            <text class="option-label">{{ opt.label }}</text>
            <text class="option-check" :class="{ 'option-check-active': isOptionSelected(currentQuestion.id, opt.id) }">{{ isOptionSelected(currentQuestion.id, opt.id) ? (currentQuestion.type === 'multi' ? '☑' : '●') : (currentQuestion.type === 'multi' ? '☐' : '○') }}</text>
          </view>
        </view>

        <!-- 提示卡片 -->
        <view v-if="currentQuestion.description" class="tip-card">
          <text class="tip-icon">ⓘ</text>
          <text class="tip-text">{{ currentQuestion.description }}</text>
        </view>
      </view>

      <!-- 空的问卷 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无题目</text>
      </view>
    </template>

    <view v-else class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">问卷不存在或未启用</text>
    </view>

    <!-- 底部操作区（参考 mockup 三栏布局） -->
    <view class="bottom-bar safe-area-bottom">
      <view class="bottom-inner">
        <view class="fav-btn" @tap="toggleFavorite">
          <text class="fav-btn-icon" :class="{ 'fav-btn-active': isFavorited }">{{ isFavorited ? '♥' : '♡' }}</text>
          <text class="fav-btn-label" :class="{ 'fav-btn-active': isFavorited }">收藏</text>
        </view>
        <view class="bottom-back" @tap="currentIndex > 0 ? goPrevQuestion() : goBack()">
          <text class="bottom-back-icon">←</text>
          <text>{{ currentIndex > 0 ? '上一题' : '返回' }}</text>
        </view>
        <view v-if="isLastQuestion" class="bottom-submit" @tap="handleSubmit">
          <text>查看报告</text>
          <text class="bottom-next-icon">›</text>
        </view>
        <view v-else class="bottom-next" @tap="goNextQuestion">
          <text>下一题</text>
          <text class="bottom-next-icon">›</text>
        </view>
      </view>
    </view>

    <!-- 结果弹窗 -->
    <view v-if="showResult" class="modal-overlay" @tap="closeResult">
      <view class="modal-sheet" @tap.stop="">
        <view class="modal-handle"></view>
        <view class="modal-body">
          <!-- 评测结果区域 -->
          <template v-if="scoringResult">
            <view class="result-header">
              <view class="result-score-wrap" :style="{ background: riskColor + '15' }">
                <text class="result-score" :style="{ color: riskColor }">{{ scoringResult.totalScore }}</text>
                <text class="result-score-label">总分</text>
              </view>
              <view class="result-grade-badge" :style="{ background: riskColor }">
                <text class="result-grade-text">{{ scoringResult.riskLevel }}</text>
              </view>
              <text class="result-title">评测完成</text>
              <text class="result-desc">{{ scoringResult.grade }}</text>
            </view>

            <!-- 评定结论 -->
            <view class="scoring-detail-card">
              <text class="scoring-detail-label">评定结论</text>
              <text class="scoring-detail-text">{{ scoringResult.conclusion }}</text>
            </view>

            <!-- 建议措施 -->
            <view class="scoring-detail-card">
              <text class="scoring-detail-label">建议措施</text>
              <text class="scoring-detail-text">{{ scoringResult.suggestion }}</text>
            </view>

            <!-- 一票否决提示 -->
            <view v-if="scoringResult.vetoTriggered" class="veto-alert-card">
              <text class="veto-alert-icon">⚠️</text>
              <text class="veto-alert-text">一票否决项触发：{{ (scoringResult.vetoItems || []).join('、') }}</text>
            </view>

            <!-- 付费选项（如果有付费的） -->
            <template v-if="hasPaidOptions">
              <view class="pay-cards">
                <view
                  v-for="opt in payOptions"
                  :key="opt.type"
                  class="pay-card"
                  :class="{
                    'pay-card-selected': selectedReportType === opt.type,
                    'pay-card-manual': opt.type === 'manual',
                    'pay-card-auto': opt.type !== 'manual'
                  }"
                  @tap="selectPayOption(opt)"
                >
                  <view class="pay-card-top">
                    <view class="pay-card-badge" :class="opt.type === 'manual' ? 'badge-manual' : 'badge-auto'">
                      <text>{{ opt.type === 'manual' ? '👤' : '📄' }}</text>
                    </view>
                    <text class="pay-card-price" :class="opt.type === 'manual' ? 'price-manual' : 'price-auto'">{{ opt.priceLabel }}</text>
                  </view>
                  <view class="pay-card-body">
                    <text class="pay-card-title">{{ opt.label }}</text>
                    <text class="pay-card-desc">{{ opt.type === 'manual' ? '资深HR一对一服务，定制化咨询、人工审核资料及法律建议' : '含详细风险清单及自动化整改方案，立即获取改进建议' }}</text>
                  </view>
                  <view class="pay-card-cta" :class="opt.type === 'manual' ? 'cta-manual' : 'cta-auto'">
                    <text>{{ opt.type === 'manual' ? '预约专家' : '立即获取' }}</text>
                    <text class="pay-card-arrow">→</text>
                  </view>
                </view>
              </view>
              <view class="btn-pay" @tap="confirmPay">
                <text>确认并支付</text>
              </view>
              <text class="social-proof">已有 1,248 位企业主选择专家服务</text>
            </template>

            <!-- 全免费时只显示关闭按钮 -->
            <view v-else class="btn-close-result" @tap="closeResult">
              <text>关闭</text>
            </view>
          </template>

          <!-- 未开启评测：原有付费流程 -->
          <template v-else>
            <view class="result-header">
              <view class="result-icon-wrap">
                <text class="result-icon">📊</text>
              </view>
              <text class="result-title">测评已完成</text>
              <text class="result-desc">根据您的回答，系统已初步识别潜在风险</text>
            </view>

            <view class="pay-cards">
              <view
                v-for="opt in payOptions"
                :key="opt.type"
                class="pay-card"
                :class="{
                  'pay-card-selected': selectedReportType === opt.type,
                  'pay-card-manual': opt.type === 'manual',
                  'pay-card-auto': opt.type !== 'manual'
                }"
                @tap="selectPayOption(opt)"
              >
                <view class="pay-card-top">
                  <view class="pay-card-badge" :class="opt.type === 'manual' ? 'badge-manual' : 'badge-auto'">
                    <text>{{ opt.type === 'manual' ? '👤' : '📄' }}</text>
                  </view>
                  <text class="pay-card-price" :class="opt.type === 'manual' ? 'price-manual' : 'price-auto'">{{ opt.priceLabel }}</text>
                </view>
                <view class="pay-card-body">
                  <text class="pay-card-title">{{ opt.label }}</text>
                  <text class="pay-card-desc">{{ opt.type === 'manual' ? '资深HR一对一服务，定制化咨询、人工审核资料及法律建议' : '含详细风险清单及自动化整改方案，立即获取改进建议' }}</text>
                </view>
                <view class="pay-card-cta" :class="opt.type === 'manual' ? 'cta-manual' : 'cta-auto'">
                  <text>{{ opt.type === 'manual' ? '预约专家' : '立即获取' }}</text>
                  <text class="pay-card-arrow">→</text>
                </view>
              </view>
            </view>

            <view class="btn-pay" @tap="confirmPay">
              <text>确认并支付</text>
            </view>
            <text class="social-proof">已有 1,248 位企业主选择专家服务</text>
          </template>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getCategoryContentDetail, submitQuestionnaire, createReportOrder, invokePayment, addFavorite, removeFavorite, getFavorites } from '@/api/index.js'

// 模块级标志位：防止 HMR 重复触发跳转（不随 Vue 实例销毁）
let _surveyRedirecting = false

export default {
  data() {
    return {
      contentId: 0,
      isFavorited: false,
      questionnaire: null,
      questionnaireTitle: '',
      questions: [],
      currentIndex: 0,
      answers: {},
      loading: true,

      // 结果弹窗
      showResult: false,
      payOptions: [],
      answerId: 0,
      selectedReportType: '',
      paying: false,
      scoringResult: null
    }
  },
  computed: {
    currentQuestion() {
      if (this.questions.length === 0) return null
      return this.questions[this.currentIndex] || null
    },
    isLastQuestion() {
      return this.currentIndex >= this.questions.length - 1
    },
    percent() {
      if (this.questions.length === 0) return 0
      return Math.round(((this.currentIndex + 1) / this.questions.length) * 100)
    },
    hasPaidOptions() {
      return this.payOptions.some(opt => opt.price > 0)
    },
    riskColor() {
      if (!this.scoringResult) return '#67c23a'
      const grade = this.scoringResult.grade || ''
      if (grade.includes('D')) return '#e31e24'
      if (grade.includes('C')) return '#e6a23c'
      if (grade.includes('B')) return '#409eff'
      return '#67c23a'
    }
  },
  onLoad(options) {
    if (_surveyRedirecting) return
    const contentId = parseInt(options.contentId) || 0
    if (contentId) {
      // 先检查是否已登录，未登录直接跳转（不发任何请求）
      const token = uni.getStorageSync('token')
      if (!token) {
        _surveyRedirecting = true
        const redirectUrl = '/pages/survey/index?contentId=' + contentId
        const loginUrl = '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl)
        console.log('[survey] 未登录，直接跳转登录页')
        uni.redirectTo({
          url: loginUrl,
          fail: () => uni.reLaunch({ url: loginUrl })
        })
        return
      }
      this.loadFromContent(contentId)
    }
  },
  methods: {
    async loadFromContent(contentId) {
      try {
        const detail = await getCategoryContentDetail(contentId)
        console.log('[survey] Content Detail:', JSON.stringify(detail))
        console.log('[survey] authRequired:', detail && detail.authRequired)
        if (!detail) {
          uni.showToast({ title: '内容不存在', icon: 'none' })
          this.loading = false
          return
        }
        // 检查是否需要登录（token过期/无效时后端返回 authRequired）
        if (detail.authRequired) {
          if (_surveyRedirecting) return
          _surveyRedirecting = true
          console.log('[survey] token无效，清除并跳转登录页')
          // 清除无效 token，避免下次仍然发送无效 token
          uni.removeStorageSync('token')
          this.loading = false
          const redirectUrl = '/pages/survey/index?contentId=' + contentId
          const loginUrl = '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl)
          uni.redirectTo({
            url: loginUrl,
            fail: () => uni.reLaunch({ url: loginUrl })
          })
          return
        }
        // 非 survey 类型重定向到 flow-detail
        if (detail.serviceType !== 'survey') {
          uni.redirectTo({ url: '/pages/flow-detail/index?contentId=' + contentId })
          return
        }
        // 服务端已在 GetContentDetail 中内联问卷数据
        this.contentId = contentId
        this.isFavorited = !!detail.isFavorited
        console.log('[survey] isFavorited:', detail.isFavorited, 'contentId:', contentId)
        const q = detail.questionnaire
        if (!q || !q.questions || q.questions.length === 0) {
          uni.showToast({ title: '该分类下没有问卷', icon: 'none' })
          this.loading = false
          return
        }
        this.questionnaire = q
        this.questionnaireTitle = q.title || '在线问卷'
        this.questions = q.questions || []
        this.answers = {}
        this.questions.forEach(qn => { this.answers[qn.id] = [] })
        uni.setNavigationBarTitle({ title: q.title || '在线问卷' })
        this.loading = false
      } catch (e) {
        console.error('通过 contentId 加载问卷失败:', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
        this.loading = false
      }
    },

    isOptionSelected(questionId, optionId) {
      return (this.answers[questionId] || []).includes(optionId)
    },

    handleOptionTap(question, opt) {
      if (question.type === 'multi') {
        this.toggleOption(question.id, opt.id)
      } else {
        this.selectSingleOption(question.id, opt.id)
      }
    },

    selectSingleOption(questionId, optionId) {
      this.answers[questionId] = [optionId]
    },

    toggleOption(questionId, optionId) {
      const current = this.answers[questionId] || []
      const idx = current.indexOf(optionId)
      if (idx > -1) {
        current.splice(idx, 1)
      } else {
        current.push(optionId)
      }
      this.answers[questionId] = current
    },

    goNextQuestion() {
      const cur = this.currentQuestion
      if (cur) {
        const selected = this.answers[cur.id] || []
        if (selected.length === 0) {
          uni.showToast({ title: '请先选择一个选项', icon: 'none' })
          return
        }
      }
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      }
    },

    goPrevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },

    async handleSubmit() {
      const token = uni.getStorageSync('token')
      if (!token) {
        // 未登录跳转登录页
        const redirectUrl = '/pages/survey/index?contentId=' + this.contentId
        uni.redirectTo({
          url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl),
          fail: () => uni.reLaunch({ url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl) })
        })
        return
      }

      const answersPayload = this.questions.map(q => ({
        questionId: q.id,
        optionIds: this.answers[q.id] || []
      }))

      try {
        uni.showLoading({ title: '提交中...' })
        const res = await submitQuestionnaire(this.questionnaire.id, answersPayload)
        uni.hideLoading()

        this.answerId = res.answerId
        this.payOptions = res.payOptions || []
        this.scoringResult = res.scoringResult || null

        if (this.hasPaidOptions) {
          // 付费问卷 → 跳转人工咨询（20分钟 9.9元）
          uni.navigateTo({
            url: '/pages/support-chat/index?serviceCategory=问卷评测&consultPrice=9.9&consultDuration=20'
          })
        } else {
          // 免费问卷 → 直接显示评测结果
          this.showResult = true
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '提交失败', icon: 'none' })
      }
    },

    selectPayOption(opt) {
      this.selectedReportType = opt.type
    },

    closeResult() {
      this.showResult = false
    },

    async confirmPay() {
      if (!this.selectedReportType) {
        uni.showToast({ title: '请选择报告类型', icon: 'none' })
        return
      }
      if (this.paying) return
      this.paying = true

      try {
        uni.showLoading({ title: '创建订单...' })
        const orderRes = await createReportOrder(this.questionnaire.id, this.answerId, this.selectedReportType)
        uni.showLoading({ title: '支付中...' })
        await invokePayment(orderRes.orderId)
        uni.hideLoading()
        uni.showToast({ title: '支付成功', icon: 'success' })
        this.showResult = false

        // 跳转到报告页面
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/report/index?id=' + orderRes.reportId })
        }, 1500)
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '支付失败', icon: 'none' })
      } finally {
        this.paying = false
      }
    },

    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    },

    /** 收藏/取消收藏 */
    async toggleFavorite() {
      if (!this.contentId) return
      // 未登录跳转登录页
      const token = uni.getStorageSync('token')
      if (!token) {
        const redirectUrl = '/pages/survey/index?contentId=' + this.contentId
        uni.redirectTo({
          url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl),
          fail: () => uni.reLaunch({ url: '/pages/login/index?redirect=' + encodeURIComponent(redirectUrl) })
        })
        return
      }
      try {
        if (this.isFavorited) {
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
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: #faf9f9;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.loading-state { display: flex; align-items: center; justify-content: center; padding-top: 120rpx; }
.loading-text { font-size: 28rpx; color: #909399; }

/* 进度条 */
.progress-section {
  padding: 24rpx 32rpx 16rpx;
  margin-bottom: 64rpx;
  background: #fff;
  border-radius: 0 0 24rpx 24rpx;
}
.progress-info {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 16rpx;
}
.progress-text { font-size: 24rpx; color: var(--color-primary); font-weight: 500; }
.progress-percent { font-size: 22rpx; color: var(--color-on-surface-variant); }
.progress-bar-bg {
  width: 100%; height: 6rpx;
  background: var(--color-surface-container); border-radius: 9999px; overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--color-primary); border-radius: 9999px;
  transition: width 0.5s ease-out;
}

/* 题目 */
.question-section {
  padding: 0 32rpx;
}
.question-title {
  font-size: 36rpx; font-weight: 600; color: var(--color-on-surface);
  display: block; margin-bottom: 48rpx; line-height: 1.45;
}
.options-wrap { display: flex; flex-direction: column; gap: 32rpx; }
.option-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx;
  background: var(--color-surface-container-lowest);
  border: 2px solid #e5e7eb;
  border-radius: var(--radius-xl);
  transition: all 0.2s;
}
.option-item:active { transform: scale(0.98); }
.option-selected {
  border-color: var(--color-primary);
  background: rgba(0,83,205,0.04);
}
.option-label {
  flex: 1;
  font-size: 32rpx; line-height: 1.45;
  color: inherit;
}
.option-check {
  width: 40rpx; height: 40rpx; border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex; align-items: center; justify-content: center;
  font-size: 0; color: transparent;
  flex-shrink: 0;
  margin-left: 16rpx;
  transition: all 0.2s;
}
.option-check-active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  font-size: 20rpx;
  color: #fff;
}

/* 提示卡 */
.tip-card {
  display: flex; align-items: flex-start; gap: 16rpx;
  padding: 32rpx;
  background: #f1f5f9;
  border-radius: var(--radius-xl); margin-top: 48rpx;
}
.tip-icon { font-size: 40rpx; color: var(--color-primary); flex-shrink: 0; }
.tip-text { font-size: 32rpx; color: var(--color-on-secondary-container); line-height: 1.8; }

/* 空状态 */
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 96rpx; }
.empty-icon { font-size: 64rpx; margin-bottom: 16rpx; }
.empty-text { font-size: 28rpx; color: #909399; }

/* 底部栏（参考 mockup 三栏布局） */
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid #e3e2e2;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}
.bottom-inner {
  display: flex; align-items: center; gap: 16rpx;
}
.fav-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4rpx; padding: 12rpx 16rpx; flex-shrink: 0;
}
.fav-btn-icon { font-size: 52rpx; color: #909399; line-height: 1; width: 56rpx; text-align: center; }
.fav-btn-label { font-size: 24rpx; color: #909399; font-weight: 500; }
.fav-btn-active { color: #ba1a1a; }
.bottom-back {
  display: flex; align-items: center; justify-content: center; gap: 6rpx;
  flex: 1; height: 88rpx;
  border: 1px solid #e5e7eb; border-radius: 9999rpx;
  font-size: 28rpx; color: #606266; font-weight: 500;
  background: #fff;
  transition: all 0.15s;
}
.bottom-back:active { background: #f5f5f5; transform: scale(0.97); }
.bottom-back-icon { font-size: 28rpx; }
.bottom-next, .bottom-submit {
  display: flex; align-items: center; justify-content: center; gap: 6rpx;
  flex: 2; height: 88rpx;
  font-size: 28rpx; color: #fff; font-weight: 600;
  background: var(--color-primary);
  border-radius: 9999rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,83,205,0.2);
  transition: all 0.15s;
}
.bottom-next:active, .bottom-submit:active { opacity: 0.85; transform: scale(0.97); }
.bottom-next-icon { font-size: 32rpx; font-weight: 700; }

/* 结果弹窗 */
.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
}
.modal-sheet {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: #fff; border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  animation: slideUp 0.35s ease-out;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-handle {
  width: 48rpx; height: 6rpx;
  background: #c2c6d8; border-radius: 3rpx;
  margin: 12rpx auto 0;
}
.modal-body { padding: 24rpx 32rpx 48rpx; }
.result-header { text-align: center; margin-bottom: 32rpx; }
.result-icon-wrap {
  width: 128rpx; height: 128rpx;
  border-radius: 50%; background: rgba(0,83,205,0.1);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 24rpx;
}
.result-icon { font-size: 56rpx; }
.result-title { font-size: 40rpx; font-weight: 700; color: #1b1c1c; display: block; margin-bottom: 8rpx; }
.result-desc { font-size: 26rpx; color: #5b5f65; }

/* 支付选项卡片（双色主题：auto=蓝 / manual=橙） */
.pay-cards { display: flex; flex-direction: column; gap: 24rpx; margin-bottom: 32rpx; }
.pay-card {
  display: flex; flex-direction: column; gap: 16rpx;
  padding: 32rpx; border-radius: 32rpx;
  border: 1px solid var(--color-outline-variant);
  background: var(--color-surface-container-lowest);
  transition: all 0.25s;
}
.pay-card:active { transform: scale(0.98); }
/* 自动报告：蓝色调 */
.pay-card-auto {
  border-color: rgba(0,83,205,0.25);
  background: rgba(0,83,205,0.03);
}
.pay-card-auto.pay-card-selected {
  border-color: var(--color-primary);
  background: rgba(0,83,205,0.06);
  box-shadow: 0 0 0 2rpx rgba(0,83,205,0.15);
}
/* 人工报告：橙色调 */
.pay-card-manual {
  border-color: rgba(161,59,0,0.25);
  background: rgba(161,59,0,0.03);
}
.pay-card-manual.pay-card-selected {
  border-color: var(--color-tertiary);
  background: rgba(161,59,0,0.06);
  box-shadow: 0 0 0 2rpx rgba(161,59,0,0.15);
}

.pay-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.pay-card-badge {
  width: 64rpx; height: 64rpx; border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx;
}
.badge-auto { background: var(--color-primary); }
.badge-manual { background: var(--color-tertiary-container); }
.pay-card-price { font-size: 40rpx; font-weight: 700; color: var(--color-on-surface); }
.price-auto { color: var(--color-primary); }
.price-manual { color: var(--color-tertiary); }

.pay-card-body { display: flex; flex-direction: column; gap: 8rpx; }
.pay-card-title { font-size: 32rpx; font-weight: 600; color: var(--color-on-surface); }
.pay-card-desc { font-size: 22rpx; color: var(--color-on-surface-variant); line-height: 1.55; }

.pay-card-cta {
  display: flex; align-items: center; gap: 8rpx;
  font-size: 24rpx; font-weight: 500;
}
.cta-auto { color: var(--color-primary); }
.cta-manual { color: var(--color-tertiary); }
.pay-card-arrow { font-size: 28rpx; font-weight: 600; }

.btn-pay {
  width: 100%; height: 96rpx;
  background: #0053cd; color: #fff;
  border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,83,205,0.3);
  margin-bottom: 16rpx;
}
.btn-pay:active { transform: scale(0.98); }
.social-proof { font-size: 22rpx; color: #909399; text-align: center; display: block; }

/* 评测结果样式 */
.result-score-wrap {
  width: 160rpx; height: 160rpx;
  border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  margin: 0 auto 20rpx;
}
.result-score { font-size: 56rpx; font-weight: 800; line-height: 1; }
.result-score-label { font-size: 22rpx; color: #5b5f65; margin-top: 4rpx; }
.result-grade-badge {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 8rpx 28rpx; border-radius: 9999px;
  margin: 0 auto 16rpx; width: fit-content;
}
.result-grade-text { font-size: 24rpx; font-weight: 600; color: #fff; }
.scoring-detail-card {
  background: #f5f7fa; border-radius: 16rpx; padding: 24rpx;
  margin-bottom: 16rpx;
}
.scoring-detail-label { font-size: 24rpx; color: #909399; display: block; margin-bottom: 8rpx; font-weight: 600; }
.scoring-detail-text { font-size: 28rpx; color: #1b1c1c; line-height: 1.6; display: block; }
.veto-alert-card {
  display: flex; align-items: center; gap: 12rpx;
  background: #fef0f0; border: 1px solid #fde2e2; border-radius: 16rpx;
  padding: 20rpx 24rpx; margin-bottom: 24rpx;
}
.veto-alert-icon { font-size: 32rpx; flex-shrink: 0; }
.veto-alert-text { font-size: 26rpx; color: #e31e24; line-height: 1.5; }
.btn-close-result {
  width: 100%; height: 88rpx;
  background: #f5f7fa; color: #606266;
  border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 30rpx; font-weight: 500;
  margin-top: 16rpx;
}
.btn-close-result:active { background: #e9ebf0; }
</style>
