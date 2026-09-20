import { computed, onBeforeMount, onBeforeUnmount, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

const WIDTH = 992

function isMobile() {
  const width = document.documentElement.clientWidth || document.body.clientWidth
  return width - 1 < WIDTH
}

export function useResizeHandler() {
  const store = useStore()
  const route = useRoute()

  const sidebar = computed(() => store.state.app.sidebar)
  const device = computed(() => store.state.app.device)

  function resizeHandler() {
    if (!document.hidden) {
      const mobile = isMobile()
      store.dispatch('app/toggleDevice', mobile ? 'mobile' : 'desktop')
      if (mobile) {
        store.dispatch('app/closeSideBar', { withoutAnimation: true })
      }
    }
  }

  watch(
    () => route.path,
    () => {
      if (device.value === 'mobile' && sidebar.value.opened) {
        store.dispatch('app/closeSideBar', { withoutAnimation: false })
      }
    }
  )

  onBeforeMount(() => {
    window.addEventListener('resize', resizeHandler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
  })

  onMounted(() => {
    const mobile = isMobile()
    store.dispatch('app/toggleDevice', mobile ? 'mobile' : 'desktop')
    if (mobile) {
      store.dispatch('app/closeSideBar', { withoutAnimation: true })
    } else {
      // 桌面端保证侧栏在屏幕内显示
      store.dispatch('app/toggleSideBarHide', false)
      if (!store.state.app.sidebar.opened) {
        store.commit('app/TOGGLE_SIDEBAR')
      }
    }
  })
}
