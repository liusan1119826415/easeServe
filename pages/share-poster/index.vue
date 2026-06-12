<template>
  <view class="page-bg">
    <view class="poster-container">
      <view class="poster-card">
        <!-- 品牌 Logo -->
        <view class="brand-header">
          <view class="brand-logo"><text class="brand-logo-icon">📦</text></view>
          <text class="brand-name">企业逻辑</text>
        </view>
        <!-- 用户头像 -->
        <view class="user-section">
          <view class="user-avatar"><image class="user-avatar-img" src="/static/logo.png" mode="aspectFill" /></view>
          <text class="user-name">张经理</text>
        </view>
        <!-- 标题 -->
        <view class="poster-headlines">
          <text class="headline-main">专业企业服务</text>
          <text class="headline-sub">邀请好友赚取奖励</text>
        </view>
        <!-- 二维码 -->
        <view class="qr-section">
          <view class="qr-wrap">
            <image class="qr-img" src="/static/logo.png" mode="aspectFit" />
          </view>
          <text class="qr-label">扫码加入</text>
        </view>
      </view>
    </view>
    <!-- 操作栏 -->
    <view class="action-bar safe-area-bottom">
      <view class="btn-secondary" @tap="savePoster"><text class="btn-secondary-text">保存海报</text></view>
      <view class="btn-primary-action" @tap="sharePoster"><text class="btn-primary-text">分享好友</text></view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    savePoster() { uni.showToast({ title: '海报保存成功', icon: 'success' }) },
    sharePoster() { uni.showToast({ title: '分享功能调用中', icon: 'none' }) }
  }
}
</script>

<style scoped>
.page-bg {
  min-height: 100vh;
  background-color: #F5F7FA;
  display: flex;
  flex-direction: column;
}
.poster-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
}
.poster-card {
  width: 100%;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(30,111,255,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 48rpx;
}
.brand-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 48rpx; }
.brand-logo { width: 56rpx; height: 56rpx; background-color: #1E6FFF; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
.brand-logo-icon { font-size: 28rpx; }
.brand-name { font-size: 36rpx; font-weight: 700; color: #333; }
.user-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 60rpx; }
.user-avatar { width: 128rpx; height: 128rpx; border-radius: 50%; overflow: hidden; border: 4rpx solid #fff; box-shadow: var(--shadow-sm); margin-bottom: 16rpx; }
.user-avatar-img { width: 100%; height: 100%; }
.user-name { font-size: 32rpx; font-weight: 500; color: #555; }
.poster-headlines { text-align: center; margin-bottom: 60rpx; }
.headline-main { font-size: 56rpx; font-weight: 800; color: #1E6FFF; display: block; margin-bottom: 16rpx; }
.headline-sub { font-size: 36rpx; color: #999; }
.qr-section { display: flex; flex-direction: column; align-items: center; }
.qr-wrap { padding: 20rpx; border: 4rpx solid #1E6FFF; border-radius: 24rpx; background: #fff; box-shadow: var(--shadow-sm); margin-bottom: 16rpx; }
.qr-img { width: 280rpx; height: 280rpx; }
.qr-label { font-size: 24rpx; color: #999; letter-spacing: 4rpx; }
.action-bar {
  display: flex;
  padding: 24rpx;
  gap: 20rpx;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
.btn-secondary {
  flex: 1;
  padding: 28rpx 0;
  border-radius: var(--radius-full);
  border: 2rpx solid #1E6FFF;
  text-align: center;
}
.btn-secondary-text { color: #1E6FFF; font-weight: 700; font-size: var(--font-body-md); }
.btn-primary-action {
  flex: 1.5;
  padding: 28rpx 0;
  border-radius: var(--radius-full);
  background-color: #1E6FFF;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(30,111,255,0.3);
}
.btn-primary-text { color: #fff; font-weight: 700; font-size: var(--font-body-md); }
</style>
