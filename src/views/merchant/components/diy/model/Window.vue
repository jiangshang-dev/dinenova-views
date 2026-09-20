<template>
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
      :class="{ selected: index === selectedIndex }"
    >
      <div class="diy-window">
        <ul
          class="data-list"
          :style="{
            background: item.style.bgcolor,
          }"
          v-if="item.style.layout > -1"
          :class="'column__' + item.style.layout"
        >
          <li
            :key="index"
            v-for="(window, index) in item.data"
            :style="{
              borderRadius: window.radius + 'px',
            }"
          >
            <div class="item-image">
              <img :src="$addPrefix(window.imgUrl)" />
            </div>
          </li>
        </ul>
        <div class="hot-wrap" v-else>
          <div
            class="img-box-wrap-1"
            v-if="item.data.length > 0"
            :style="{
              borderRadius: item.data[0].radius + 'px',
            }"
          >
            <img class="img" :src="$addPrefix(item.data[0].imgUrl)" />
          </div>
          <div class="hot-wrap-r">
            <div
              class="img-box-wrap-2"
              v-if="item.data.length > 1"
              :style="{
                borderRadius: item.data[1].radius + 'px',
              }"
            >
              <img class="img" :src="$addPrefix(item.data[1].imgUrl)" />
            </div>
            <div
              class="img-box-wrap-3"
              v-if="item.data.length > 2"
              :style="{
                borderRadius: item.data[2].radius + 'px',
              }"
            >
              <img class="img" :src="$addPrefix(item.data[2].imgUrl)" />
            </div>
          </div>
        </div>
      </div>
      <div class="btn-edit-del">
        <div class="btn-del" @click.stop="onDeleleItem(index)">删除</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'

defineOptions({ name: 'Window' })

const props = defineProps(['item', 'index', 'selectedIndex'])

const emit = defineEmits([])

function onEditer(index) {

      emit("onEditer", index);
    
}

function onDeleleItem(index) {

      emit("onDeleleItem", index);
    
}
</script>

<style lang="scss" scoped>
.drag.optional {
  overflow: hidden;
  border: 1px solid transparent;
}

.diy-window .data-list {
  display: flex;
  flex-wrap: wrap;
}

.diy-window .data-list .item-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
  }
}

.diy-window .data-list li {
  overflow: hidden;
}

.diy-window .data-list.column__1 li {
  width: 100%;
  height: 100px;
  margin-top: 10px;
}

.diy-window .data-list.column__1 li:nth-child(1) {
  margin-top: 0;
}

.diy-window .data-list.column__2 li {
  width: calc((100% - 10px) / 2);
  margin-top: 10px;
}

.diy-window .data-list.column__2 li:nth-child(1),
.diy-window .data-list.column__2 li:nth-child(2) {
  margin-top: 0;
}

.diy-window .data-list.column__2 li:nth-child(2n) {
  margin-left: 10px;
}

.diy-window .data-list.column__3 li {
  width: calc((100% - 20px) / 3);
  margin-top: 10px;
  margin-right: 10px;
}

.diy-window .data-list.column__3 li:nth-child(1),
.diy-window .data-list.column__3 li:nth-child(2),
.diy-window .data-list.column__3 li:nth-child(3) {
  margin-top: 0;
}

.diy-window .data-list.column__3 li:nth-child(3n) {
  margin-right: 0;
}

.diy-window .data-list.column__4 li {
  width: calc((100% - 30px) / 4);
  margin-top: 10px;
  margin-right: 10px;
}

.diy-window .data-list.column__4 li:nth-child(1),
.diy-window .data-list.column__4 li:nth-child(2),
.diy-window .data-list.column__4 li:nth-child(3),
.diy-window .data-list.column__4 li:nth-child(4) {
  margin-top: 0;
}

.diy-window .data-list.column__4 li:nth-child(4n) {
  margin-right: 0;
}

.hot-wrap {
  display: flex;
}

.hot-wrap .img-box-wrap-1 {
  width: calc((100% - 10px) / 2);
  height: 100%;
  overflow: hidden;
}

.hot-wrap .img-box-wrap-1 .img {
  width: 100%;
  height: auto;
}

.hot-wrap-r {
  flex: 1;
  margin-left: 10px;
  position: relative;
}

.hot-wrap-r .img-box-wrap-2 {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: calc((100% - 10px) / 2);
  overflow: hidden;
}

.hot-wrap-r .img-box-wrap-3 {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: calc((100% - 10px) / 2);
  overflow: hidden;
}

.hot-wrap-r.img {
  width: 100%;
  height: 100%;
}
</style>
