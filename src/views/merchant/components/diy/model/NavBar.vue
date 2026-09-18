<template>
  <!--
      	描述：diy组件-模拟显示-导航组
      -->
  <div @click.stop="onEditer(index)">
    <div
      class="drag optional"
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
      }"
    >
      <div class="diy-navBar">
        <div
          class="diy-item"
          :style="{ width: item.style.rowsNum == 1 ? '25%' : '20%' }"
          :key="index"
          v-for="(navBar, index) in item.data"
        >
          <div class="img_wrap">
            <img class="img" :src="$addPrefix(navBar.imgUrl)" alt="" />
          </div>
          <div class="text1" :style="{ color: navBar.titlecolor }">
            {{ navBar.title }}
          </div>
        </div>
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
  overflow: hidden;
  border: 1px solid transparent;
}

.diy-navBar {
  display: flex;
  flex-wrap: wrap;
}

.diy-item {
  margin: 5px 0 10px;
}

.img_wrap {
  text-align: center;
}

.img_wrap .img {
  display: inline-block;
  vertical-align: middle;
  width: 35px !important;
  height: 35px !important;
  object-fit: contain;
}

.diy-item .text1 {
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
  white-space: nowrap; /* 确保文本不会换行 */
  overflow: hidden; /* 超出容器的文本会被隐藏 */
  text-overflow: ellipsis;
}
</style>
