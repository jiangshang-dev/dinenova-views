<template>
  <el-color-picker
    v-model="theme"
    :predefine="['#113a28', '#00a7ac', '#304156','#212121','#11a983', '#13c2c2', '#6959CD', '#f5222d' ]"
    class="theme-picker"
    popper-class="theme-picker-dropdown" />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'

const ORIGINAL_THEME = '#113a28'

const emit = defineEmits(['change'])

const store = useStore()

const chalk = ref('')
const theme = ref('')

const defaultTheme = computed(() => store.state.settings.theme)

watch(defaultTheme, (val) => {
  theme.value = val
}, { immediate: true })

watch(theme, async (val) => {
  await setTheme(val)
})

onMounted(() => {
  if (defaultTheme.value !== ORIGINAL_THEME) {
    setTheme(defaultTheme.value)
  }
})

async function setTheme(val) {
  if (typeof val !== 'string') return
  document.documentElement.style.setProperty('--el-color-primary', val)
  emit('change', val)
}

function updateStyle(style, oldCluster, newCluster) {
  let newStyle = style
  oldCluster.forEach((color, index) => {
    newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
  })
  return newStyle
}

function getCSSString(url, variable) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        if (variable === 'chalk') {
          chalk.value = xhr.responseText.replace(/@font-face{[^}]+}/, '')
        }
        resolve()
      }
    }
    xhr.open('GET', url)
    xhr.send()
  })
}

function getThemeCluster(themeColor) {
  const tintColor = (color, tint) => {
    let red = parseInt(color.slice(0, 2), 16)
    let green = parseInt(color.slice(2, 4), 16)
    let blue = parseInt(color.slice(4, 6), 16)

    if (tint === 0) {
      return [red, green, blue].join(',')
    } else {
      red += Math.round(tint * (255 - red))
      green += Math.round(tint * (255 - green))
      blue += Math.round(tint * (255 - blue))

      red = red.toString(16)
      green = green.toString(16)
      blue = blue.toString(16)

      return `#${red}${green}${blue}`
    }
  }

  const shadeColor = (color, shade) => {
    let red = parseInt(color.slice(0, 2), 16)
    let green = parseInt(color.slice(2, 4), 16)
    let blue = parseInt(color.slice(4, 6), 16)

    red = Math.round((1 - shade) * red)
    green = Math.round((1 - shade) * green)
    blue = Math.round((1 - shade) * blue)

    red = red.toString(16)
    green = green.toString(16)
    blue = blue.toString(16)

    return `#${red}${green}${blue}`
  }

  const clusters = [themeColor]
  for (let i = 0; i <= 9; i++) {
    clusters.push(tintColor(themeColor, Number((i / 10).toFixed(2))))
  }
  clusters.push(shadeColor(themeColor, 0.1))
  return clusters
}
</script>

<style>
.theme-message,
.theme-picker-dropdown {
  z-index: 99999 !important;
}

.theme-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

.theme-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>
