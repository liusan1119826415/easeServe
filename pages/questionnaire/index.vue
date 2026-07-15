<template>
  <view class="page-container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <template v-else-if="questionnaire">
      <!-- 问卷头部 -->
      <view class="q-header">
        <text class="q-title">{{ questionnaire.title }}</text>
        <text v-if="questionnaire.description" class="q-desc">{{ questionnaire.description }}</text>
      </view>

      <!-- 题目列表 -->
      <view class="q-body">
        <view v-for="(q, qi) in questions" :key="q.id" class="q-question-card">
          <view class="q-question-header">
            <text class="q-question-num">{{ qi + 1 }}.</text>
            <text class="q-question-title">{{ q.title }}</text>
            <text v-if="q.type === 'multi'" class="q-type-badge">多选</text>
          </view>

          <!-- 单选题 -->
          <view v-if="q.type === 'single'" class="q-options">
            <view
              v-for="opt in q.options"
              :key="opt.id"
              class="q-option"
              :class="{ 'q-option-selected': isOptionSelected(q.id, opt.id) }"
              @tap="selectSingleOption(q.id, opt.id)"
            >
              <view class="q-radio" :class="{ 'q-radio-checked': isOptionSelected(q.id, opt.id) }">
                <text v-if="isOptionSelected(q.id, opt.id)" class="q-radio-dot">●</text>
              </view>
              <text class="q-option-label">{{ opt.label }}</text>
            </view>
          </view>

          <!-- 多选题 -->
          <view v-if="q.type === 'multi'" class="q-options">
            <view
              v-for="opt in q.options"
              :key="opt.id"
              class="q-option"
              :class="{ 'q-option-selected': isOptionSelected(q.id, opt.id) }"
              @tap="toggleMultiOption(q.id, opt.id)"
            >
              <view class="q-checkbox" :class="{ 'q-checkbox-checked': isOptionSelected(q.id, opt.id) }">
                <text v-if="isOptionSelected(q.id, opt.id)" class="q-checkbox-icon">✓</text>
              </view>
              <text class="q-option-label">{{ opt.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="q-footer safe-area-bottom">
        <view class="btn-submit" :class="{ 'btn-disabled': !canSubmit }" @tap="handleSubmit">
          <text>提交答案</text>
        </view>
      </view>
    </template>

    <!-- 错误状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">问卷不存在或未启用</text>
    </view>

    <!-- 付费选项弹窗 -->
    <view v-if="showPayModal" class="modal-overlay" @tap="closePayModal">
      <view class="modal-content" @tap.stop="">
        <text class="modal-title">选择报告类型</text>
        <text class="modal-desc">提交成功！请选择您需要的报告类型：</text>

        <view class="pay-option-list">
          <view
            v-for="(opt, idx) in payOptions"
            :key="idx"
            class="pay-option-card"
            @tap="selectPayOption(opt)"
          >
            <view class="pay-option-left">
              <text class="pay-option-label">{{ opt.label }}</text>
              <text class="pay-option-price">{{ opt.priceLabel }}</text>
            </view>
            <text class="pay-option-arrow">›</text>
          </view>
        </view>

        <view class="modal-close" @tap="closePayModal">
          <text>暂不查看</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getQuestionnaire, submitQuestionnaire, createReportOrder, invokePayment } from '@/api/index.js'

export default {
  data() {
    return {
      questionnaireId: 0,
      questionnaire: null,
      questions: [],
      answers: {}, // { questionId: [optionId1, optionId2] }
      loading: true,

      // 付费弹窗
      showPayModal: false,
      payOptions: [],
      answerId: 0,
      paying: false
    }
  },
  computed: {
    canSubmit() {
      if (!this.questions || this.questions.length === 0) return false
      return this.questions.every(q => {
        const selected = this.answers[q.id]
        return selected && selected.length > 0
      })
    }
  },
  onLoad(options) {
    this.questionnaireId = parseInt(options.id) || 0
    if (this.questionnaireId) {
      this.loadQuestionnaire()
    }
  },
  methods: {
    async loadQuestionnaire() {
      try {
        const res = await getQuestionnaire(this.questionnaireId)
        if (res) {
          this.questionnaire = res
          this.questions = res.questions || []
          // 初始化答案
          this.answers = {}
          this.questions.forEach(q => {
            this.answers[q.id] = []
          })
          uni.setNavigationBarTitle({ title: res.title || '自测问卷' })
        }
      } catch (e) {
        console.error('加载问卷失败:', e)
      } finally {
        this.loading = false
      }
    },

    isOptionSelected(questionId, optionId) {
      const selected = this.answers[questionId] || []
      return selected.includes(optionId)
    },

    selectSingleOption(questionId, optionId) {
      this.answers[questionId] = [optionId]
    },

    toggleMultiOption(questionId, optionId) {
      const selected = this.answers[questionId] || []
      const idx = selected.indexOf(optionId)
      if (idx >= 0) {
        selected.splice(idx, 1)
      } else {
        selected.push(optionId)
      }
      this.answers[questionId] = [...selected]
    },

    async handleSubmit() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请完成所有题目', icon: 'none' })
        return
      }

      // 检查登录状态
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/login/index?redirect=' + encodeURIComponent('/pages/questionnaire/index?id=' + this.questionnaireId) })
        }, 1500)
        return
      }

      // 构建答案数据
      const answersPayload = this.questions.map(q => ({
        questionId: q.id,
        optionIds: this.answers[q.id] || []
      }))

      try {
        uni.showLoading({ title: '提交中...' })
        const res = await submitQuestionnaire(this.questionnaireId, answersPayload)
        uni.hideLoading()
        this.answerId = res.answerId
        this.payOptions = res.payOptions || []
        if (this.payOptions.length > 0) {
          this.showPayModal = true
        } else {
          uni.showToast({ title: '提交成功', icon: 'success' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '提交失败: ' + (e.message || ''), icon: 'none' })
      }
    },

    async selectPayOption(option) {
      if (this.paying) return
      this.paying = true

      try {
        uni.showLoading({ title: '创建订单...' })
        const orderRes = await createReportOrder(this.questionnaireId, this.answerId, option.type)
        const orderId = orderRes.orderId

        uni.showLoading({ title: '支付中...' })
        await invokePayment(orderId)

        uni.hideLoading()
        this.showPayModal = false
        uni.showToast({ title: '支付成功', icon: 'success' })

        // 跳转到报告页面
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/report/index?id=' + orderRes.reportId })
        }, 1500)
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '支付失败: ' + (e.message || ''), icon: 'none' })
      } finally {
        this.paying = false
      }
    },

    closePayModal() {
      this.showPayModal = false
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: #faf9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 200rpx 0;
}
.loading-text {
  font-size: 28rpx;
  color: #909399;
}

/* 问卷头部 */
.q-header {
  background: linear-gradient(135deg, #0053cd, #146bfb);
  padding: 48rpx 32rpx;
  color: #fff;
}
.q-title {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 12rpx;
}
.q-desc {
  font-size: 26rpx;
  opacity: 0.85;
  line-height: 1.5;
}

/* 题目列表 */
.q-body {
  padding: 24rpx;
  flex: 1;
}
.q-question-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  border: 1px solid #e3e2e2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.q-question-header {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  margin-bottom: 20rpx;
}
.q-question-num {
  font-size: 30rpx;
  font-weight: 700;
  color: #0053cd;
  min-width: 44rpx;
}
.q-question-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1b1c1c;
  flex: 1;
  line-height: 1.5;
}
.q-type-badge {
  font-size: 22rpx;
  color: #a13b00;
  background: rgba(161, 59, 0, 0.1);
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  white-space: nowrap;
}

/* 选项 */
.q-options {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.q-option {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 20rpx;
  border-radius: 12rpx;
  border: 1px solid #e3e2e2;
  transition: all 0.2s;
}
.q-option:active {
  background: #f4f3f3;
}
.q-option-selected {
  border-color: #0053cd;
  background: rgba(0, 83, 205, 0.04);
}
.q-radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2px solid #c2c6d8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.q-radio-checked {
  border-color: #0053cd;
  background: #0053cd;
}
.q-radio-dot {
  font-size: 20rpx;
  color: #fff;
}
.q-checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  border: 2px solid #c2c6d8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.q-checkbox-checked {
  border-color: #0053cd;
  background: #0053cd;
}
.q-checkbox-icon {
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
}
.q-option-label {
  font-size: 28rpx;
  color: #1b1c1c;
  line-height: 1.5;
  flex: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}
.empty-icon { font-size: 72rpx; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #909399; }

/* 底部 */
.q-footer {
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
.btn-submit {
  height: 100rpx;
  background-color: #0053cd;
  color: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 83, 205, 0.3);
}
.btn-submit:active {
  transform: scale(0.98);
  opacity: 0.9;
}
.btn-disabled {
  background: #c2c6d8;
  box-shadow: none;
  pointer-events: none;
}

/* 付费弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}
.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1b1c1c;
  display: block;
  margin-bottom: 8rpx;
}
.modal-desc {
  font-size: 26rpx;
  color: #727787;
  display: block;
  margin-bottom: 28rpx;
}
.pay-option-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.pay-option-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  background: rgba(0, 83, 205, 0.04);
  border: 1px solid rgba(0, 83, 205, 0.15);
  border-radius: 16rpx;
  transition: background 0.2s;
}
.pay-option-card:active {
  background: rgba(0, 83, 205, 0.1);
}
.pay-option-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.pay-option-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #1b1c1c;
}
.pay-option-price {
  font-size: 36rpx;
  font-weight: 700;
  color: #0053cd;
}
.pay-option-arrow {
  font-size: 36rpx;
  color: #0053cd;
  font-weight: 300;
}
.modal-close {
  text-align: center;
  padding: 24rpx 0;
}
.modal-close text {
  font-size: 28rpx;
  color: #909399;
}
</style>
