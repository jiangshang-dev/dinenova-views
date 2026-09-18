<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    pageTitle() {
      const settings = this.$store.state.settings
      const name = import.meta.env.VUE_APP_TITLE
      const title = settings.dynamicTitle && settings.title
      return title ? `${title} - ${name}` : name
    }
  },
  watch: {
    pageTitle: {
      immediate: true,
      handler(title) {
        if (title) {
          document.title = title
        }
      }
    }
  }
}
</script>
