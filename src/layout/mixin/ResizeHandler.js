import store from '@/store'
import Cookies from 'js-cookie'

const WIDTH = 992 // refer to Bootstrap's responsive design

export default {
  watch: {
    $route() {
      if (this.device === 'mobile' && this.sidebar.opened) {
        store.dispatch('app/closeSideBar', { withoutAnimation: false })
      }
    }
  },
  beforeMount() {
    window.addEventListener('resize', this.$_resizeHandler)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.$_resizeHandler)
  },
  mounted() {
    this.$_syncSidebarByViewport()
  },
  methods: {
    $_isMobile() {
      // 用 window.innerWidth，避免 body 尺寸被其它样式影响导致误判成手机端
      return window.innerWidth - 1 < WIDTH
    },
    $_openDesktopSidebar() {
      store.dispatch('app/toggleDevice', 'desktop')
      store.dispatch('app/toggleSideBarHide', false)
      // 若本地布局配置开了 TopNav，首页会把侧栏藏掉；桌面默认用左侧菜单
      try {
        const raw = localStorage.getItem('layout-setting')
        if (raw) {
          const conf = JSON.parse(raw)
          if (conf && conf.topNav) {
            conf.topNav = false
            localStorage.setItem('layout-setting', JSON.stringify(conf))
            store.dispatch('settings/changeSetting', { key: 'topNav', value: false })
          }
        }
      } catch (e) {
        // ignore
      }
      if (!store.state.app.sidebar.opened) {
        store.state.app.sidebar.opened = true
        store.state.app.sidebar.withoutAnimation = false
        Cookies.set('sidebarStatus', 1)
      }
    },
    $_syncSidebarByViewport() {
      if (this.$_isMobile()) {
        store.dispatch('app/toggleDevice', 'mobile')
        store.dispatch('app/closeSideBar', { withoutAnimation: true })
      } else {
        this.$_openDesktopSidebar()
      }
    },
    $_resizeHandler() {
      if (!document.hidden) {
        this.$_syncSidebarByViewport()
      }
    }
  }
}
