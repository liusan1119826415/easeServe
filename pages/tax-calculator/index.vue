<template>
  <view class="page-container">
    <!-- 基础工资 -->
    <view class="card">
      <view class="card-header"><view class="card-bar"></view><text class="card-title">基础工资与社保</text></view>
      <view class="form-row"><text class="form-label">月度税前工资 (元)</text><input class="form-input" type="digit" v-model="monthlySalary" placeholder="请输入金额" /></view>
      <view class="form-row"><text class="form-label">年度税前工资 (元)</text><text class="form-value">{{ annualSalary }}</text></view>
      <view class="form-row form-row-last"><text class="form-label">月度五险一金 (元)</text><input class="form-input" type="digit" v-model="socialSecurity" placeholder="请输入金额" /></view>
      <view class="tip-box"><text class="tip-text">起征点标准：月度 5,000.00 元，年度 60,000.00 元</text></view>
    </view>

    <!-- 专项附加扣除 -->
    <view class="card">
      <view class="card-header"><view class="card-bar"></view><text class="card-title">专项附加扣除 (月度)</text></view>
      <view class="deduction-item" v-for="(d, i) in deductions" :key="i">
        <view class="deduction-left">
          <switch :checked="d.checked" @change="(e) => d.checked = e.detail.value" color="#1E6FFF" style="transform:scale(0.7)" />
          <text class="deduction-name">{{ d.name }}</text>
        </view>
        <view class="deduction-right">
          <input class="deduction-input" type="digit" v-model="d.value" placeholder="金额" />
          <text class="deduction-unit">元</text>
        </view>
      </view>
    </view>

    <!-- 按钮 -->
    <view class="btn-group">
      <view class="btn-reset" @tap="resetForm"><text class="btn-reset-text">重置</text></view>
      <view class="btn-calc" @tap="calculate"><text class="btn-calc-text">开始计算</text></view>
    </view>

    <!-- 结果 -->
    <view class="card result-card" v-if="showResult">
      <view class="result-header">
        <text class="result-header-title">计算结果</text>
        <text class="result-header-tag">仅供参考</text>
      </view>
      <view class="result-table">
        <view class="result-row result-header-row">
          <text class="result-cell">项目</text>
          <text class="result-cell result-cell-right">月度</text>
          <text class="result-cell result-cell-right">年度</text>
        </view>
        <view class="result-row"><text class="result-cell">应纳税额</text><text class="result-cell result-cell-right">{{ result.taxableMonth }}</text><text class="result-cell result-cell-right">{{ result.taxableYear }}</text></view>
        <view class="result-row"><text class="result-cell">适用税率</text><text class="result-cell result-cell-right">{{ result.rateMonth }}</text><text class="result-cell result-cell-right">{{ result.rateYear }}</text></view>
        <view class="result-row"><text class="result-cell">速算扣除数</text><text class="result-cell result-cell-right">{{ result.quickMonth }}</text><text class="result-cell result-cell-right">{{ result.quickYear }}</text></view>
        <view class="result-row result-highlight"><text class="result-cell result-bold">应缴税款</text><text class="result-cell result-cell-right result-bold result-primary">{{ result.taxMonth }}</text><text class="result-cell result-cell-right result-bold result-primary">{{ result.taxYear }}</text></view>
        <view class="result-row result-final"><text class="result-cell result-bold">税后实发</text><text class="result-cell result-cell-right result-bold">{{ result.finalMonth }}</text><text class="result-cell result-cell-right result-bold">{{ result.finalYear }}</text></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      monthlySalary: '15000',
      socialSecurity: '1500',
      deductions: [
        { name: '子女教育', checked: false, value: '2000' },
        { name: '继续教育', checked: false, value: '400' },
        { name: '赡养老人', checked: false, value: '3000' },
        { name: '首套房贷', checked: false, value: '1000' },
        { name: '住房租金', checked: false, value: '' },
        { name: '大病医疗', checked: false, value: '' },
        { name: '3岁以下婴幼儿', checked: false, value: '2000' }
      ],
      showResult: false,
      result: {}
    }
  },
  computed: {
    annualSalary() { return ((parseFloat(this.monthlySalary) || 0) * 12).toFixed(2) }
  },
  methods: {
    calculate() {
      const monthly = parseFloat(this.monthlySalary) || 0
      const social = parseFloat(this.socialSecurity) || 0
      const threshold = 5000
      let deductionTotal = 0
      this.deductions.forEach(d => { if (d.checked) deductionTotal += parseFloat(d.value) || 0 })
      const taxableMonth = Math.max(0, monthly - social - threshold - deductionTotal)
      const getTaxInfo = (amount) => {
        if (amount <= 3000) return { rate: '3%', quick: 0, tax: amount * 0.03 }
        if (amount <= 12000) return { rate: '10%', quick: 210, tax: amount * 0.1 - 210 }
        if (amount <= 25000) return { rate: '20%', quick: 1410, tax: amount * 0.2 - 1410 }
        return { rate: '25%', quick: 2660, tax: amount * 0.25 - 2660 }
      }
      const m = getTaxInfo(taxableMonth)
      this.result = {
        taxableMonth: taxableMonth.toFixed(2), taxableYear: (taxableMonth * 12).toFixed(2),
        rateMonth: m.rate, rateYear: m.rate,
        quickMonth: m.quick.toFixed(2), quickYear: m.quick.toFixed(2),
        taxMonth: m.tax.toFixed(2), taxYear: (m.tax * 12).toFixed(2),
        finalMonth: (monthly - social - m.tax).toFixed(2),
        finalYear: ((monthly - social - m.tax) * 12).toFixed(2)
      }
      this.showResult = true
    },
    resetForm() {
      this.monthlySalary = '15000'; this.socialSecurity = '1500'
      this.deductions.forEach(d => { d.checked = false })
      this.showResult = false
    }
  }
}
</script>

<style scoped>
.page-container { background: #F8F9FA; min-height: 100vh; padding: var(--space-md); padding-bottom: 40rpx; }
.card { background: #fff; padding: 32rpx; border-radius: var(--radius-lg); margin-bottom: var(--space-md); box-shadow: var(--shadow-sm); }
.card-header { display: flex; align-items: center; margin-bottom: 24rpx; }
.card-bar { width: 6rpx; height: 28rpx; background: #1E6FFF; border-radius: var(--radius-full); margin-right: 12rpx; }
.card-title { font-size: var(--font-body-md); font-weight: 600; color: #888; }
.form-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20rpx; margin-bottom: 20rpx; border-bottom: 1px solid #f5f5f5; }
.form-row-last { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.form-label { font-size: var(--font-body-md); color: #666; }
.form-input { width: 50%; text-align: right; font-size: var(--font-body-md); font-weight: 500; }
.form-value { font-size: var(--font-body-md); font-weight: 500; color: var(--color-on-surface); }
.tip-box { margin-top: 20rpx; padding: 16rpx; background: #EBF5FF; border-radius: var(--radius-md); }
.tip-text { font-size: var(--font-caption); color: #1E6FFF; }
.deduction-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28rpx; }
.deduction-left { display: flex; align-items: center; gap: 12rpx; }
.deduction-name { font-size: var(--font-body-md); color: #333; }
.deduction-right { display: flex; align-items: center; gap: 8rpx; }
.deduction-input { width: 140rpx; border: 1px solid #e0e0e0; border-radius: var(--radius-md); padding: 6rpx 12rpx; font-size: var(--font-label-sm); text-align: right; }
.deduction-unit { font-size: var(--font-caption); color: #999; }
.btn-group { display: flex; gap: var(--space-md); padding: 16rpx 0; }
.btn-reset { flex: 1; padding: 20rpx 0; background: #fff; border: 1px solid #e0e0e0; border-radius: var(--radius-lg); text-align: center; }
.btn-reset-text { font-size: var(--font-body-md); font-weight: 500; color: #666; }
.btn-calc { flex: 1; padding: 20rpx 0; background: #1E6FFF; border-radius: var(--radius-lg); text-align: center; box-shadow: 0 8rpx 24rpx rgba(30,111,255,0.3); }
.btn-calc-text { font-size: var(--font-body-md); font-weight: 500; color: #fff; }
.result-card { overflow: hidden; padding: 0; }
.result-header { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 32rpx; background: #f9f9f9; border-bottom: 1px solid #f0f0f0; }
.result-header-title { font-size: var(--font-body-md); font-weight: 600; color: #333; }
.result-header-tag { font-size: var(--font-caption); color: #999; }
.result-table { padding: 24rpx 32rpx; }
.result-row { display: flex; padding: 16rpx 0; border-bottom: 1px solid #f9f9f9; }
.result-header-row { color: #999; border-bottom: 1px solid #f5f5f5; }
.result-cell { flex: 1; font-size: var(--font-body-md); color: #666; }
.result-cell-right { text-align: right; }
.result-bold { font-weight: 600; color: #333; }
.result-primary { color: #1E6FFF; }
.result-highlight { background: rgba(30,111,255,0.03); }
.result-final { background: rgba(30,111,255,0.05); padding: 20rpx 8rpx; border-radius: var(--radius-md); margin-top: 8rpx; }
</style>
