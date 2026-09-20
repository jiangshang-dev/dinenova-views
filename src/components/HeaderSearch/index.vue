<template>
  <div :class="{'show':show}" class="header-search" title="查找功能">
    <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
    <el-select
      ref="headerSearchSelectRef"
      v-model="search"
      :remote-method="querySearch"
      filterable
      default-first-option
      remote
      placeholder="查找功能"
      class="header-search-select"
      @change="change">
      <el-option v-for="option in options" :key="option.item.path" :value="option.item" :label="option.item.title.join(' > ')" />
    </el-select>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Fuse from 'fuse.js/dist/fuse.min.js'
import path from '@/utils/nodePath'

defineOptions({ name: 'HeaderSearch' })

const router = useRouter()
const store = useStore()

const search = ref('')
const options = ref([])
const searchPool = ref([])
const show = ref(false)
const fuse = ref(undefined)
const headerSearchSelectRef = ref(null)

const routes = computed(() => store.getters.permission_routes)

watch(routes, () => {
  searchPool.value = generateRoutes(routes.value)
})

watch(searchPool, (list) => {
  initFuse(list)
})

watch(show, (value) => {
  if (value) {
    document.body.addEventListener('click', close)
  } else {
    document.body.removeEventListener('click', close)
  }
})

onMounted(() => {
  searchPool.value = generateRoutes(routes.value)
})

function click() {
  show.value = !show.value
  if (show.value) {
    headerSearchSelectRef.value && headerSearchSelectRef.value.focus()
  }
}

function close() {
  headerSearchSelectRef.value && headerSearchSelectRef.value.blur()
  options.value = []
  show.value = false
}

function change(val) {
  const valPath = val.path
  if (ishttp(val.path)) {
    const pindex = valPath.indexOf('http')
    window.open(valPath.substr(pindex, valPath.length), '_blank')
  } else {
    router.push(val.path)
  }
  search.value = ''
  options.value = []
  nextTick(() => {
    show.value = false
  })
}

function initFuse(list) {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [{
      name: 'title',
      weight: 0.7
    }, {
      name: 'path',
      weight: 0.3
    }]
  })
}

function generateRoutes(routesList, basePath = '/', prefixTitle = []) {
  let res = []

  for (const router of routesList) {
    if (router.hidden) { continue }

    const data = {
      path: !ishttp(router.path) ? path.resolve(basePath, router.path) : router.path,
      title: [...prefixTitle]
    }

    if (router.meta && router.meta.title) {
      data.title = [...data.title, router.meta.title]

      if (router.redirect !== 'noRedirect') {
        res.push(data)
      }
    }

    if (router.children) {
      const tempRoutes = generateRoutes(router.children, data.path, data.title)
      if (tempRoutes.length >= 1) {
        res = [...res, ...tempRoutes]
      }
    }
  }
  return res
}

function querySearch(query) {
  if (query !== '') {
    options.value = fuse.value.search(query)
  } else {
    options.value = []
  }
}

function ishttp(url) {
  return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1
}
</script>

<style lang="scss" scoped>
.header-search {
  font-size: 0 !important;

  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }

  .header-search-select {
    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;

    :deep(.el-input__inner) {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }

  &.show {
    .header-search-select {
      width: 210px;
      margin-left: 10px;
    }
  }
}
</style>
