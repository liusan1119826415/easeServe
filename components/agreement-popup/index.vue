<template>
  <view class="agreement-mask" v-if="visible" @tap.self="close">
    <view class="agreement-modal">
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
        <view class="modal-close" @tap="close">
          <text class="close-icon">✕</text>
        </view>
      </view>
      <scroll-view class="modal-body" scroll-y>
        <view v-if="loading" class="loading-wrap">
          <text class="loading-text">加载中...</text>
        </view>
        <view v-else-if="error" class="error-wrap">
          <text class="error-text">{{ error }}</text>
        </view>
        <rich-text v-else :nodes="content" class="agreement-content"></rich-text>
      </scroll-view>
      <view class="modal-footer">
        <view class="footer-btn" @tap="close">
          <text class="footer-btn-text">关闭</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAgreement } from '@/api/index.js'

export default {
  name: 'agreement-popup',
  props: {
    visible: { type: Boolean, default: false },
    type: { type: String, default: 'user' } // 'user' | 'privacy'
  },
  data() {
    return {
      title: '',
      content: '',
      loading: false,
      error: ''
    }
  },
  watch: {
    visible(val) {
      if (val && this.type) {
        this.loadAgreement()
      }
    }
  },
  methods: {
    async loadAgreement() {
      this.loading = true
      this.error = ''
      this.title = this.type === 'user' ? '用户服务协议' : '隐私保护政策'
      try {
        const res = await getAgreement(this.type)
        this.title = res.title || this.title
        this.content = res.content || ''
      } catch (e) {
        this.error = '协议内容加载失败，请稍后再试'
      } finally {
        this.loading = false
      }
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.agreement-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.agreement-modal {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
}

.close-icon {
  font-size: 14px;
  color: #999;
}

.modal-body {
  flex: 1;
  max-height: 60vh;
  padding: 16px 20px;
}

.loading-wrap, .error-wrap {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.loading-text {
  color: #999;
  font-size: 14px;
}

.error-text {
  color: #e53935;
  font-size: 14px;
}

.agreement-content {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.modal-footer {
  padding: 12px 20px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #f0f0f0;
}

.footer-btn {
  height: 44px;
  border-radius: 22px;
  background: var(--color-primary, #0053cd);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-btn-text {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}
</style>
