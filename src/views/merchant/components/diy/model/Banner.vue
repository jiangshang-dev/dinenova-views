<template>
  <div @click.stop="onEditer(index)">
    <div
      class="drag optional"
      @click.stop="onEditer(index)"
      :class="{ selected: index === selectedIndex }"
      :style="{
        background: item.style.bgcolor,
        paddingLeft: item.style.paddingLeft + 'px',
        paddingRight: item.style.paddingLeft + 'px',
        paddingTop: item.style.paddingTop + 'px',
        paddingBottom: item.style.paddingTop + 'px',
        marginLeft: item.style.marginLeft + 'px',
        marginRight: item.style.marginLeft + 'px',
        marginTop: item.style.marginTop + 'px',
        marginBottom: item.style.marginBottom + 'px',
        borderTopLeftRadius: item.style.topRadio + 'px',
        borderTopRightRadius: item.style.topRadio + 'px',
        borderBottomLeftRadius: item.style.bottomRadio + 'px',
        borderBottomRightRadius: item.style.bottomRadio + 'px',
        borderColor: item.style.borderColor,
        height: item.style.height + 'px',
      }"
    >
      <div class="pic-wrap">
        <img
          class="banner-img"
          :src="$addPrefix((item.data[0] && item.data[0].imgUrl))"
        />
      </div>
      <div class="btn-edit-del">
        <div class="btn-del" @click.stop="onDeleleItem(index)">删除</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ["item", "index", "selectedIndex"],
  methods: {
    onEditer(index) {
      this.$emit("onEditer", index);
    },
    onDeleleItem(index) {
      this.$emit("onDeleleItem", index);
    },
  },
};
</script>

<style lang="scss" scoped>
.drag.optional {
  border: 1px solid transparent;
  overflow: hidden;
}

.banner-img {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
