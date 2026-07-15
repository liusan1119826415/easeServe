<template>
  <view class="page-container">
    <!-- 用户头像区 -->
    <view class="profile-section">
      <view class="avatar-wrap" @tap="isLoggedIn ? chooseAvatar() : goLogin()">
        <image class="avatar" :key="avatarKey" :src="userInfo.avatar || defaultAvatar" mode="aspectFill" />
        <view class="avatar-camera-icon" v-if="isLoggedIn">
          <text class="camera-text">📷</text>
        </view>
      </view>
      <view class="profile-info">
        <text class="user-name" v-if="isLoggedIn">{{ userInfo.nickname || '用户' }}</text>
        <text class="user-phone" v-if="isLoggedIn">{{ maskPhone(userInfo.phone) }}</text>
        <view class="login-btn" v-else @tap="goLogin">
          <text class="login-btn-text">点击登录</text>
        </view>
      </view>
      <view class="edit-btn" v-if="isLoggedIn" @tap="openEdit">
        <text class="edit-btn-text">完善资料</text>
      </view>
    </view>

    <!-- VIP 会员卡 -->
    <view class="vip-card" @tap="goMembership">
      <view class="vip-header">
        <view class="vip-left">
          <text class="vip-icon">⭐</text>
          <text class="vip-title">{{ vipLabel }}</text>
        </view>
        <text class="vip-tag">{{ vipTag }}</text>
      </view>
      <text class="vip-detail">{{ vipDetail }}</text>
      <view class="vip-footer">
        <view class="vip-renew-btn">
          <text class="vip-renew-text">{{ isLoggedIn ? (hasSubscription ? '续费会员' : '开通会员') : '登录后查看' }}</text>
        </view>
      </view>
      <view class="vip-decor"></view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view class="menu-item" v-for="(item, i) in menuList" :key="i" @tap="goMenu(item)">
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-label">{{ item.label }}</text>
        </view>
        <text class="menu-chevron">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" v-if="isLoggedIn" @tap="handleLogout">
      <text class="logout-text">退出登录</text>
    </view>

    <!-- 底部导航 -->
    <BottomNav :active="3" />


  </view>
</template>

<script>
import { getProfile, logout, getMySubscription, uploadFile, updateProfile } from '@/api/index.js'
import BottomNav from '@/components/BottomNav.vue'

export default {
  components: { BottomNav },
  data() {
    return {
      defaultAvatar: 'https://pic1.zhimg.com/v2-7d63e24e29ff2f3d8b7c6e7a4e5b5c5d_r.jpg',
      avatarKey: 0,
      isLoggedIn: false,
      userInfo: {},
      subscription: null,
      hasSubscription: false,
      remainingDays: 0,
      enterpriseInfo: null,
      menuList: [
        { icon: '📋', label: '我的订单', path: '/pages/orders/index' },
        { icon: '💬', label: '我的咨询', path: '/pages/my-consultations/index' },
        { icon: '❤️', label: '我的收藏', path: '/pages/favorites/index' },
        { icon: '🕐', label: '浏览历史', path: '/pages/history/index' },
        { icon: '📦', label: '套餐管理', path: '/pages/membership/index' },
        { icon: '🎧', label: '联系客服', path: '/pages/contact/index' },
        { icon: '🔗', label: '推荐分享', path: '/pages/share-poster/index' }
      ]
    }
  },
  computed: {
    vipLabel() {
      if (!this.isLoggedIn) return 'VIP 会员'
      if (this.hasSubscription && this.subscription && this.subscription.tier) {
        return this.subscription.tier.name || 'VIP 会员'
      }
      return '普通用户'
    },
    vipTag() {
      if (!this.isLoggedIn) return '登录后查看'
      if (this.hasSubscription) return '专属特权'
      return '开通享特权'
    },
    vipDetail() {
      if (!this.isLoggedIn) return '登录后查看会员权益'
      if (this.hasSubscription) {
        return `${this.subscription.tier ? this.subscription.tier.period || '月' : '月'}套餐 · 剩余 ${this.remainingDays} 天`
      }
      return '暂无会员订阅'
    }
  },
  onShow() {
    this.checkLogin()
  },
  methods: {
    checkLogin() {
      const token = uni.getStorageSync('token')
      if (token) {
        this.isLoggedIn = true
        // 从缓存读取基本信息
        try {
          const cached = uni.getStorageSync('userInfo')
          if (cached) this.userInfo = JSON.parse(cached)
        } catch (e) {}
        this.fetchProfile()
        this.fetchSubscription()
      } else {
        this.isLoggedIn = false
        this.userInfo = {}
        this.subscription = null
        this.hasSubscription = false
      }
    },

    async fetchProfile() {
      try {
        const res = await getProfile()
        if (res && res.user) {
          this.userInfo = res.user
          this.avatarKey++
          // 缓存企业信息
          if (res.enterprise && res.enterprise.id) {
            this.enterpriseInfo = res.enterprise
            uni.setStorageSync('enterpriseInfo', JSON.stringify(res.enterprise))
          }
          // 更新缓存
          uni.setStorageSync('userInfo', JSON.stringify({
            id: res.user.id,
            phone: res.user.phone,
            nickname: res.user.nickname,
            avatar: res.user.avatar,
            userType: res.user.userType,
            vipLevel: res.user.vipLevel,
            occupation: res.user.occupation || ''
          }))
        }
      } catch (e) {
        // 请求失败（如token过期），清除登录态
        if (e && e.status === 401) {
          this.clearLogin()
        }
        console.log('获取个人资料失败:', e)
      }
    },

    async fetchSubscription() {
      try {
        const res = await getMySubscription()
        this.hasSubscription = res.hasSubscription || false
        this.subscription = res.subscription || null
        this.remainingDays = res.remainingDays || 0
      } catch (e) {
        // 忽略
      }
    },

    maskPhone(phone) {
      if (!phone || phone.length < 11) return phone
      return phone.substring(0, 3) + '****' + phone.substring(7)
    },

    goLogin() {
      uni.navigateTo({ url: '/pages/login-register/index' })
    },
    goMembership() {
      uni.navigateTo({ url: '/pages/membership/index' })
    },
    goMenu(item) {
      if (!this.isLoggedIn) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        this.goLogin()
        return
      }
      if (item.path) uni.navigateTo({ url: item.path })
    },

    openEdit() {
      // 根据用户类型跳转到对应注册页完善资料
      if (this.userInfo.userType === 2) {
        uni.navigateTo({ url: '/pages/enterprise-register/index?mode=edit' })
      } else {
        uni.navigateTo({ url: '/pages/personal-register/index?mode=edit' })
      }
    },

    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await logout()
            } catch (e) {
              // 即使接口失败也清除本地
            }
            this.clearLogin()
            uni.showToast({ title: '已退出登录', icon: 'none' })
          }
        }
      })
    },

    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempPath = res.tempFilePaths[0]
          uni.showLoading({ title: '上传中...' })
          try {
            const uploadRes = await uploadFile(tempPath, 'avatar')
            const newAvatar = uploadRes.fileUrl
            // 更新到服务器
            await updateProfile({ avatar: newAvatar })
            // 更新本地显示和缓存
            this.userInfo.avatar = newAvatar
            this.avatarKey++
            try {
              const cached = JSON.parse(uni.getStorageSync('userInfo') || '{}')
              cached.avatar = newAvatar
              uni.setStorageSync('userInfo', JSON.stringify(cached))
            } catch (e) {}
            uni.showToast({ title: '头像更新成功', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: '上传失败，请重试', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    },

    clearLogin() {
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('enterpriseInfo')
      this.isLoggedIn = false
      this.userInfo = {}
      this.enterpriseInfo = null
      this.subscription = null
      this.hasSubscription = false
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-background);
  min-height: 100vh;
  padding: var(--space-md);
  padding-bottom: 130rpx;
}

/* 头像区 */
.profile-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}
.avatar-wrap {
  position: relative;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-surface-container-high);
  flex-shrink: 0;
}
.avatar { width: 100%; height: 100%; }
.avatar-camera-icon {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 36rpx; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}
.camera-text { font-size: 20rpx; }
.profile-info { flex: 1; }
.user-name {
  font-size: var(--font-h1);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
  margin-bottom: 4rpx;
}
.user-phone {
  font-size: var(--font-label-sm);
  color: var(--color-on-surface-variant);
}
.login-btn {
  background-color: var(--color-primary);
  padding: 8rpx 28rpx;
  border-radius: var(--radius-full);
  width: fit-content;
}
.login-btn-text {
  font-size: var(--font-label-sm);
  font-weight: 500;
  color: var(--color-on-primary);
}
.edit-btn {
  padding: 8rpx 20rpx;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-full);
}
.edit-btn-text {
  font-size: var(--font-label-sm);
  color: var(--color-on-surface-variant);
}

/* VIP卡 */
.vip-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-md);
}
.vip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.vip-left { display: flex; align-items: center; gap: 8rpx; }
.vip-icon { font-size: 36rpx; }
.vip-title { font-size: var(--font-h2); font-weight: 600; color: var(--color-on-primary); }
.vip-tag { font-size: var(--font-caption); color: rgba(255,255,255,0.8); }
.vip-detail { font-size: var(--font-body-lg); font-weight: 600; color: var(--color-on-primary); display: block; }
.vip-footer { margin-top: 16rpx; display: flex; justify-content: flex-end; }
.vip-renew-btn {
  background-color: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 6rpx 24rpx;
  border-radius: var(--radius-full);
}
.vip-renew-text { font-size: var(--font-label-sm); color: var(--color-on-primary); }
.vip-decor {
  position: absolute; right: -32rpx; bottom: -32rpx;
  width: 160rpx; height: 160rpx;
  background: rgba(255,255,255,0.1); border-radius: 50%;
}

/* 菜单 */
.menu-section {
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-outline-variant);
}
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background-color: rgba(223,226,237,0.2); }
.menu-left { display: flex; align-items: center; gap: var(--space-md); }
.menu-icon { font-size: 36rpx; }
.menu-label { font-size: var(--font-body-md); color: var(--color-on-surface); }
.menu-chevron { font-size: 28rpx; color: var(--color-secondary); }

/* 退出 */
.logout-btn {
  margin-top: var(--space-lg);
  background-color: var(--color-surface-container-lowest);
  padding: 28rpx 0;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
}
.logout-text { color: var(--color-error); font-size: var(--font-h2); font-weight: 600; }


</style>
