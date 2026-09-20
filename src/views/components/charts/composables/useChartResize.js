import { onMounted, onBeforeUnmount, onActivated, onDeactivated } from 'vue'
import { debounce } from '@/utils'

export function useChartResize(getChart) {
  let sidebarElm = null
  let resizeHandler = null

  function sidebarResizeHandler(e) {
    if (e.propertyName === 'width') {
      resizeHandler?.()
    }
  }

  function resize() {
    const chart = typeof getChart === 'function' ? getChart() : getChart?.value
    chart && chart.resize()
  }

  function initListener() {
    resizeHandler = debounce(() => {
      resize()
    }, 100)
    window.addEventListener('resize', resizeHandler)
    sidebarElm = document.getElementsByClassName('sidebar-container')[0]
    sidebarElm && sidebarElm.addEventListener('transitionend', sidebarResizeHandler)
  }

  function destroyListener() {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
    sidebarElm && sidebarElm.removeEventListener('transitionend', sidebarResizeHandler)
  }

  onMounted(() => {
    initListener()
  })
  onActivated(() => {
    if (!resizeHandler) {
      initListener()
    }
    resize()
  })
  onBeforeUnmount(() => {
    destroyListener()
  })
  onDeactivated(() => {
    destroyListener()
  })

  return { resize }
}
