<template>
  <view class="page-container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 报告内容 -->
    <template v-else-if="report">
      <!-- 报告头部 -->
      <view class="report-header">
        <view class="report-status-badge" :class="statusClass">
          <text>{{ statusText }}</text>
        </view>
        <text class="report-title">{{ reportTitle }}</text>
        <text class="report-type">{{ report.reportType === 'manual' ? '人工评估报告' : '自动评估报告' }}</text>
        <text v-if="report.price > 0" class="report-price">¥{{ report.price }}</text>
      </view>

      <!-- 报告正文 -->
      <view class="report-body">
        <!-- 已完成 -->
        <view v-if="report.status === 2" class="report-content">
          <rich-text v-if="report.content" :nodes="report.content" class="rich-content" />
          <view v-if="report.fileUrl" class="file-download-card" @tap="downloadReportFile">
            <view class="file-icon-wrap">
              <text class="file-icon">📄</text>
            </view>
            <view class="file-info">
              <text class="file-name">下载报告文件</text>
              <text class="file-hint">点击下载完整报告</text>
            </view>
            <text class="file-arrow">↓</text>
          </view>
        </view>

        <!-- 处理中 -->
        <view v-else-if="report.status === 1" class="report-processing">
          <text class="processing-icon">⏳</text>
          <text class="processing-title">报告处理中</text>
          <text class="processing-desc">人工报告正在由专业人员出具中，预计1-3个工作日内完成，请耐心等待。</text>
        </view>

        <!-- 待处理 -->
        <view v-else class="report-pending">
          <text class="pending-icon">📋</text>
          <text class="pending-title">报告待处理</text>
          <text class="pending-desc">您的报告请求已提交，我们将尽快处理。</text>
        </view>
      </view>
    </template>

    <!-- 错误状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">报告不存在</text>
    </view>
  </view>
</template>

<script>
import { getReport } from '@/api/index.js'

export default {
  data() {
    return {
      reportId: 0,
      report: null,
      loading: true
    }
  },
  computed: {
    statusClass() {
      if (!this.report) return ''
      if (this.report.status === 2) return 'status-complete'
      if (this.report.status === 1) return 'status-processing'
      return 'status-pending'
    },
    statusText() {
      if (!this.report) return ''
      if (this.report.status === 2) return '已完成'
      if (this.report.status === 1) return '处理中'
      return '待处理'
    },
    reportTitle() {
      if (!this.report) return '评估报告'
      return this.report.reportType === 'manual' ? '人工评估报告' : '自动评估报告'
    }
  },
  onLoad(options) {
    this.reportId = parseInt(options.id) || 0
    if (this.reportId) {
      this.loadReport()
    }
  },
  methods: {
    async loadReport() {
      try {
        const res = await getReport(this.reportId)
        if (res) {
          this.report = res
          uni.setNavigationBarTitle({ title: '评估报告' })
        }
      } catch (e) {
        console.error('加载报告失败:', e)
      } finally {
        this.loading = false
      }
    },

    downloadReportFile() {
      if (!this.report || !this.report.fileUrl) return

      uni.showLoading({ title: '下载中...' })
      uni.downloadFile({
        url: this.report.fileUrl,
        success: (res) => {
          uni.hideLoading()
          if (res.statusCode === 200) {
            uni.openDocument({
              filePath: res.tempFilePath,
              showMenu: true,
              fail: () => {
                uni.showToast({ title: '无法打开文件', icon: 'none' })
              }
            })
          } else {
            uni.showToast({ title: '下载失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '下载失败', icon: 'none' })
        }
      })
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

/* 报告头部 */
.report-header {
  background: linear-gradient(135deg, #0053cd, #146bfb);
  padding: 48rpx 32rpx;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.report-status-badge {
  padding: 6rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}
.status-complete {
  background: rgba(255, 255, 255, 0.25);
}
.status-processing {
  background: rgba(255, 193, 7, 0.3);
}
.status-pending {
  background: rgba(255, 255, 255, 0.15);
}
.report-title {
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}
.report-type {
  font-size: 26rpx;
  opacity: 0.85;
  margin-bottom: 4rpx;
}
.report-price {
  font-size: 48rpx;
  font-weight: 700;
  margin-top: 12rpx;
}

/* 报告正文 */
.report-body {
  padding: 32rpx;
  flex: 1;
}
.report-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  border: 1px solid #e3e2e2;
}
.rich-content {
  font-size: 28rpx;
  color: #1b1c1c;
  line-height: 1.8;
}

/* 文件下载卡片 */
.file-download-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: rgba(0, 83, 205, 0.06);
  border-radius: 16rpx;
  gap: 16rpx;
  margin-top: 24rpx;
  border: 1px solid rgba(0, 83, 205, 0.15);
}
.file-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: rgba(0, 83, 205, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.file-icon { font-size: 36rpx; }
.file-info { flex: 1; }
.file-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1b1c1c;
  display: block;
  margin-bottom: 4rpx;
}
.file-hint {
  font-size: 24rpx;
  color: #909399;
}
.file-arrow {
  font-size: 28rpx;
  color: #0053cd;
  font-weight: 700;
}

/* 处理中 */
.report-processing,
.report-pending {
  background: #fff;
  border-radius: 20rpx;
  padding: 80rpx 48rpx;
  border: 1px solid #e3e2e2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.processing-icon,
.pending-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}
.processing-title,
.pending-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1b1c1c;
  margin-bottom: 16rpx;
}
.processing-desc,
.pending-desc {
  font-size: 26rpx;
  color: #727787;
  line-height: 1.6;
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
</style>
