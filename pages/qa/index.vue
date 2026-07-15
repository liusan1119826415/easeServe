<template>
  <view class="page-container">
    <!-- 顶部安全区（状态栏+胶囊按钮占位，固定高度） -->
    <view class="status-bar-placeholder" :style="{ height: statusBarHeight + 'px' }"></view>
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          placeholder="输入关键词，例如 社保缴纳"
          v-model="searchText"
          :disabled="loading"
          confirm-type="search"
          @confirm="doSearch"
        />
        <view v-if="searchText" class="search-clear" @tap="clearSearch">
          <text>✕</text>
        </view>
      </view>
    </view>

    <!-- FAQ 快捷标签 -->
    <view class="faq-section" v-if="faqList.length > 0">
      <view
        class="faq-bubble"
        v-for="(q, i) in faqList"
        :key="i"
        @tap="sendQuestion(q.question)"
      >
        <text>{{ q.question }}</text>
      </view>
    </view>

    <!-- 聊天区域 -->
    <scroll-view
      class="chat-area"
      :style="{ height: scrollHeight + 'px' }"
      :scroll-into-view="scrollIntoViewId"
      :scroll-with-animation="scrollWithAnimation"
      scroll-y
      @scrolltoupper="onScrollToUpper"
    >
      <!-- 顶部加载更多提示 -->
      <view v-if="hasMoreHistory" class="load-more-tip" @tap="loadMoreHistory">
        <text v-if="!loadingMore">↑ 点击加载更早的聊天记录</text>
        <text v-else>加载中...</text>
      </view>
      <view v-else-if="allChatMessages.length > 0" class="load-more-tip">
        <text>— 以上为最早的聊天记录 —</text>
      </view>

      <!-- 消息列表 -->
      <view
        v-for="(msg, idx) in allChatMessages"
        :key="msg._uid"
        :id="'msg-' + msg._uid"
      >
        <!-- 机器人消息 -->
        <view v-if="msg.type === 'bot'" class="msg-row msg-bot">
          <view class="msg-avatar bot-avatar">
            <text>🤖</text>
          </view>
          <view class="msg-body">
            <view class="msg-meta">
              <text class="meta-label">智能助手 {{ msg.time }}</text>
            </view>
            <view class="msg-bubble bot-bubble">
              <rich-text v-if="msg.html" :nodes="msg.content" class="msg-richtext"></rich-text>
              <text v-else class="msg-text">{{ msg.content }}</text>
            </view>
          </view>
        </view>

        <!-- 用户消息 -->
        <view v-else class="msg-row msg-user">
          <view class="msg-body msg-body-user">
            <view class="msg-meta user-meta">
              <text class="meta-label">您 {{ msg.time }}</text>
            </view>
            <view class="msg-bubble user-bubble">
              <text class="msg-text">{{ msg.content }}</text>
            </view>
          </view>
          <view class="msg-avatar user-avatar">
            <image class="user-avatar-img" :src="userAvatar || defaultAvatar" mode="aspectFill" />
          </view>
        </view>
      </view>

      <!-- 搜索加载提示 -->
      <view v-if="loading" class="loading-row">
        <view class="msg-row msg-bot">
          <view class="msg-avatar bot-avatar">
            <text>🤖</text>
          </view>
          <view class="msg-body">
            <view class="msg-bubble bot-bubble loading-bubble">
              <view class="typing-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部锚点（用于滚动到底部） -->
      <view id="scroll-bottom-anchor" style="height:2rpx;"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="action-bar" style="position:fixed; bottom:178rpx; left:0; right:0; z-index:40; background-color:#f9f9ff; padding:16rpx 24rpx; display:flex; gap:16rpx; box-shadow:0 -2rpx 8rpx rgba(0,0,0,0.06);">
      <view class="action-btn action-primary" @tap="goSmartChat">
        <text>🤖 智能客服 (自动回复)</text>
      </view>
      <view class="action-btn action-outline" @tap="goHumanChat">
        <text>👩‍💼 人工咨询 (按次收费)</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <BottomNav :active="1" />
  </view>
</template>

<script>
import { getQuickQuestions, searchQA, getQAChatHistory, saveQAChatMessages, checkConsultationEligibility, createOrder, payOrder } from '@/api/index.js'
import BottomNav from '@/components/BottomNav.vue'

const PAGE_SIZE = 30 // 每次从服务端加载的消息数

// 全局唯一ID计数器（前端临时用）
let uidCounter = Date.now()
function genUid() {
  return 'm' + (++uidCounter)
}

export default {
  components: { BottomNav },
  data() {
    return {
      searchText: '',
      faqList: [],
      // 全量消息（从服务端加载 + 本次新增）
      allChatMessages: [],
      // 服务端总记录数
      totalMessages: 0,
      // 当前已加载到本地的消息数（即 offset）
      loadedCount: 0,
      loading: false,
      loadingMore: false,
      // 滚动控制
      scrollIntoViewId: '',
      scrollWithAnimation: true,
      statusBarHeight: 0,
      scrollHeight: 0,
      userAvatar: '',
      defaultAvatar: 'https://pic1.zhimg.com/v2-7d63e24e29ff2f3d8b7c6e7a4e5b5c5d_r.jpg',
    }
  },
  computed: {
    /** 是否还有更早的消息可加载 */
    hasMoreHistory() {
      return this.loadedCount < this.totalMessages
    },
  },
  onLoad() {
    // 获取胶囊按钮位置，计算顶部安全区高度
    const sysInfo = uni.getSystemInfoSync()
    const capsuleRect = uni.getMenuButtonBoundingClientRect()
    const gap = Math.max(capsuleRect.top - sysInfo.statusBarHeight, 4)
    this.statusBarHeight = capsuleRect.bottom + gap

    // 计算聊天滚动区域高度 = 屏幕高度 - 顶部安全区 - 搜索栏 - FAQ区 - 底部操作栏 - 底部导航
    // 搜索栏约 80px, FAQ约 50px, 底部操作栏约 70px, 底部导航约 50px
    const topHeight = this.statusBarHeight
    const searchBarH = 80
    const faqH = 50
    const actionBarH = 70
    const bottomNavH = 50
    this.scrollHeight = sysInfo.windowHeight - topHeight - searchBarH - faqH - actionBarH - bottomNavH

    this.loadUserAvatar()
    this.initChat()
    this.loadQuickQuestions()
  },
  methods: {
    /** 加载用户头像 */
    loadUserAvatar() {
      try {
        const userInfo = JSON.parse(uni.getStorageSync('userInfo') || '{}')
        this.userAvatar = userInfo.avatar || ''
      } catch (e) {}
    },

    /** 初始化聊天：从服务端加载历史记录 */
    async initChat() {
      try {
        const data = await getQAChatHistory(PAGE_SIZE, 0)
        if (data && data.list && data.list.length > 0) {
          this.allChatMessages = data.list.map(m => this.serverMsgToDisplay(m))
          this.totalMessages = data.total || 0
          this.loadedCount = this.allChatMessages.length
        } else {
          // 无历史记录，显示欢迎消息
          this.allChatMessages = [{
            _uid: genUid(),
            type: 'bot',
            content: '您好！我是您的企业服务智能助手。您可以向我咨询关于社保、招聘、行政流程或政策解读等相关问题。',
            html: false,
            time: this.nowTime()
          }]
          this.totalMessages = 0
          this.loadedCount = 0
        }
      } catch (e) {
        console.error('加载聊天记录失败:', e)
        // 加载失败也显示欢迎消息
        this.allChatMessages = [{
          _uid: genUid(),
          type: 'bot',
          content: '您好！我是您的企业服务智能助手。您可以向我咨询关于社保、招聘、行政流程或政策解读等相关问题。',
          html: false,
          time: this.nowTime()
        }]
      }
      // 延迟滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom(false)
      })
    },

    /** 将服务端消息转换为前端显示格式 */
    serverMsgToDisplay(m) {
      const d = new Date(m.createdAt)
      const time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
      return {
        _uid: 's' + m.id,
        type: m.role, // user / bot
        content: m.content,
        html: m.isHtml || false,
        time: time
      }
    },

    /** 加载热门问题 */
    async loadQuickQuestions() {
      try {
        const data = await getQuickQuestions()
        this.faqList = (data && data.length > 0) ? data : []
      } catch (e) {
        console.error('加载热门问题失败:', e)
      }
    },

    /** 发送问题（从FAQ标签或搜索栏触发） */
    sendQuestion(q) {
      this.searchText = q
      this.doSearch()
    },

    /** 执行搜索 */
    async doSearch() {
      const keyword = this.searchText.trim()
      if (!keyword || this.loading) return

      // 构建要同步到服务端的新消息
      const newMessages = []

      // 添加用户消息
      const userMsg = {
        _uid: genUid(),
        type: 'user',
        content: keyword,
        time: this.nowTime()
      }
      this.allChatMessages.push(userMsg)
      newMessages.push({ role: 'user', content: keyword, isHtml: false })

      this.searchText = ''
      this.loading = true
      this.scrollToBottom(true)

      try {
        const results = await searchQA(keyword)

        if (results && results.length > 0) {
          const topResults = results.slice(0, 3)
          for (let i = 0; i < topResults.length; i++) {
            const item = topResults[i]
            const isHtml = /<[^>]+>/.test(item.answer)
            const botContent = isHtml ? item.answer : this.formatAnswer(item.answer)
            const botMsg = {
              _uid: genUid(),
              type: 'bot',
              content: botContent,
              html: isHtml,
              time: this.nowTime()
            }
            this.allChatMessages.push(botMsg)
            newMessages.push({ role: 'bot', content: botContent, isHtml: isHtml })
          }
        } else {
          const noResult = '抱歉，暂时没有找到与"' + keyword + '"相关的答案。您可以尝试其他关键词，或转人工咨询获取更详细的帮助。'
          this.allChatMessages.push({
            _uid: genUid(),
            type: 'bot',
            content: noResult,
            html: false,
            time: this.nowTime()
          })
          newMessages.push({ role: 'bot', content: noResult, isHtml: false })
        }
      } catch (e) {
        console.error('搜索失败:', e)
        const errMsg = '网络请求失败，请稍后重试。'
        this.allChatMessages.push({
          _uid: genUid(),
          type: 'bot',
          content: errMsg,
          html: false,
          time: this.nowTime()
        })
        newMessages.push({ role: 'bot', content: errMsg, isHtml: false })
      } finally {
        this.loading = false
        // 异步保存到服务端（不阻塞UI）
        this.syncMessagesToServer(newMessages)
        this.scrollToBottom(true)
      }
    },

    /** 将新消息同步到服务端 */
    async syncMessagesToServer(messages) {
      if (!messages || messages.length === 0) return
      try {
        await saveQAChatMessages(messages)
        this.totalMessages += messages.length
        this.loadedCount += messages.length
      } catch (e) {
        console.error('保存聊天记录失败:', e)
      }
    },

    /** 滚动到顶部时加载更多历史消息 */
    async loadMoreHistory() {
      if (this.loadingMore || !this.hasMoreHistory) return
      this.loadingMore = true

      // 记住当前显示的第一条消息 uid，用于加载后定位
      const oldFirstUid = this.allChatMessages.length > 0
        ? this.allChatMessages[0]._uid
        : ''

      try {
        const data = await getQAChatHistory(PAGE_SIZE, this.loadedCount)
        if (data && data.list && data.list.length > 0) {
          // 将更早的消息插入到数组头部
          const olderMsgs = data.list.map(m => this.serverMsgToDisplay(m))
          this.allChatMessages = olderMsgs.concat(this.allChatMessages)
          this.loadedCount += data.list.length
          this.totalMessages = data.total || this.loadedCount

          // DOM 更新后滚动回之前的第一条消息位置
          this.$nextTick(() => {
            if (oldFirstUid) {
              this.scrollWithAnimation = false
              this.scrollIntoViewId = ''
              setTimeout(() => {
                this.scrollIntoViewId = 'msg-' + oldFirstUid
              }, 50)
            }
          })
        }
      } catch (e) {
        console.error('加载更多聊天记录失败:', e)
      } finally {
        setTimeout(() => {
          this.loadingMore = false
        }, 300)
      }
    },

    /** 滚动到顶部事件 */
    onScrollToUpper() {
      this.loadMoreHistory()
    },

    /** 滚动到底部 */
    scrollToBottom(animated) {
      this.scrollWithAnimation = animated !== false
      this.scrollIntoViewId = ''
      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollIntoViewId = 'scroll-bottom-anchor'
        }, animated !== false ? 50 : 10)
      })
    },

    /** 格式化答案文本 */
    formatAnswer(text) {
      if (!text) return ''
      return text.replace(/\n/g, '<br/>')
    },

    /** 清空搜索 */
    clearSearch() {
      this.searchText = ''
    },

    /** 获取当前时间字符串 */
    nowTime() {
      const d = new Date()
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      return h + ':' + m
    },

    goSmartChat() {
      this.scrollToBottom(true)
      uni.showToast({ title: '请输入问题开始咨询', icon: 'none' })
    },

    async goHumanChat() {
      try {
        // 1. 检查咨询资格
        const eligibility = await checkConsultationEligibility()
        if (!eligibility) {
          uni.showToast({ title: '网络异常，请重试', icon: 'none' })
          return
        }

        // 2. VIP 且有配额 → 直接跳转
        if (eligibility.vipHasQuota) {
          const remain = eligibility.annualRemaining || eligibility.subscriptionRemaining || 0
          uni.showToast({ title: `您还有 ${remain} 次咨询配额，正在跳转...`, icon: 'none' })
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/select-support/index' })
          }, 800)
          return
        }

        // 3. 非VIP 或 无配额 → 需付费 9.9
        const confirmResult = await new Promise((resolve) => {
          uni.showModal({
            title: '人工咨询',
            content: `人工咨询 ${eligibility.payAmount} 元/次（${eligibility.payDuration} 分钟），确认支付？`,
            confirmText: '确认支付',
            cancelText: '取消',
            success: (res) => resolve(res.confirm),
            fail: () => resolve(false)
          })
        })

        if (!confirmResult) return

        // 4. 创建咨询付费订单
        uni.showLoading({ title: '创建订单...' })
        const orderRes = await createOrder({
          orderType: 3,
          title: '人工咨询 (' + eligibility.payDuration + '分钟)',
          amount: eligibility.payAmount
        })
        uni.hideLoading()

        if (!orderRes || !orderRes.orderId) {
          uni.showToast({ title: '创建订单失败', icon: 'none' })
          return
        }

        // 5. 支付
        uni.showLoading({ title: '支付中...' })
        const payRes = await payOrder(orderRes.orderId)
        uni.hideLoading()

        if (!payRes) {
          uni.showToast({ title: '支付失败，请重试', icon: 'none' })
          return
        }

        uni.showToast({ title: '支付成功，正在跳转...', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/select-support/index' })
        }, 800)
      } catch (e) {
        uni.hideLoading()
        console.error('人工咨询检查失败:', e)
        uni.showToast({ title: '操作失败，请重试', icon: 'none' })
      }
    },
  }
}
</script>

<style scoped>
.page-container {
  background-color: var(--color-background);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.status-bar-placeholder {
  flex-shrink: 0;
  width: 100%;
}
.search-bar {
  padding: var(--space-md);
  flex-shrink: 0;
}
.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: var(--color-surface-container-low);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-outline-variant);
  padding: 0 24rpx;
  height: 88rpx;
}
.search-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
}
.search-input {
  flex: 1;
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
}
.search-clear {
  margin-left: 12rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: var(--color-outline-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: var(--color-secondary);
}
.faq-section {
  padding: 0 var(--space-md);
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  flex-shrink: 0;
}
.faq-bubble {
  padding: 12rpx 24rpx;
  background-color: var(--color-surface-container-highest);
  border-radius: var(--radius-full);
  font-size: var(--font-label-sm);
  color: var(--color-on-surface-variant);
}
.faq-bubble:active {
  background-color: rgba(20,107,251,0.2);
}

/* ---- 聊天区域 (scroll-view) ---- */
.chat-area {
  padding: var(--space-lg) var(--space-md);
  box-sizing: border-box;
  flex-shrink: 0;
}

/* ---- 加载更多提示 ---- */
.load-more-tip {
  text-align: center;
  padding: 16rpx 0 24rpx;
}
.load-more-tip text {
  font-size: var(--font-caption);
  color: var(--color-primary);
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: var(--space-lg);
}
.msg-bot {
  flex-direction: row;
  max-width: 90%;
}
.msg-user {
  flex-direction: row;
  justify-content: flex-end;
  max-width: 100%;
  margin-left: 20%;
}
.msg-body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
  min-width: 0;
}
.msg-body-user {
  align-items: flex-end;
  flex: 0 1 auto;
}
.msg-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}
.bot-avatar {
  background-color: var(--color-primary-container);
}
.user-avatar {
  background-color: var(--color-secondary-container);
  overflow: hidden;
}
.user-avatar-img {
  width: 100%;
  height: 100%;
}
.msg-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.user-meta {
  align-self: flex-end;
}
.meta-label {
  font-size: var(--font-caption);
  color: var(--color-secondary);
}
.msg-bubble {
  padding: 24rpx;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-outline-variant);
  box-shadow: var(--shadow-sm);
}
.bot-bubble {
  background-color: var(--color-surface-container-low);
  border-top-left-radius: 0;
}
.user-bubble {
  background-color: var(--color-primary);
  border-top-right-radius: 0;
}
.user-bubble .msg-text {
  color: var(--color-on-primary);
}
.msg-text {
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
.msg-richtext {
  font-size: var(--font-body-md);
  color: var(--color-on-surface);
  line-height: 1.6;
}

/* ---- 加载动画 ---- */
.loading-row {
  margin-bottom: var(--space-lg);
}
.loading-bubble {
  padding: 32rpx 48rpx;
}
.typing-dots {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.typing-dots .dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background-color: var(--color-secondary);
  animation: typingBounce 1.4s ease-in-out infinite both;
}
.typing-dots .dot:nth-child(1) {
  animation-delay: 0s;
}
.typing-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ---- 底部操作栏 ---- */
.action-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-label-sm);
  font-weight: 500;
}
.action-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-md);
}
.action-outline {
  border: 1px solid var(--color-outline);
  color: var(--color-on-surface);
}
</style>
