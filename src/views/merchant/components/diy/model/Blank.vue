<template>
  <div
    class="drag optional"
    :class="{ selected: index === selectedIndex }"
    @click.stop="onEditer(index)"
    :style="{
      background: item.style.bgcolor,
      paddingLeft: item.style.paddingLeft + 'px',
      paddingRight: item.style.paddingLeft + 'px',
      paddingTop: item.style.paddingTop + 'px',
      paddingBottom: item.style.paddingBottom + 'px',
    }"
  >
    <div
      class="diy-blank"
      :style="{
        height: item.style.height + 'px',
        background: item.style.background,
        borderTopLeftRadius: item.style.topRadio + 'px',
        borderTopRightRadius: item.style.topRadio + 'px',
        borderBottomLeftRadius: item.style.bottomRadio + 'px',
        borderBottomRightRadius: item.style.bottomRadio + 'px',
      }"
    ></div>
    <div class="btn-edit-del">
      <div class="btn-del" @click.stop="onDeleleItem(index)">
        删除
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'

defineOptions({ name: 'Blank' })

const props = defineProps(['item', 'index', 'selectedIndex'])

const emit = defineEmits([])

function onEditer(index) {

      emit("onEditer", index);
    
}

function onDeleleItem(index) {

      emit("onDeleleItem", index);
    
}
</script>

<style lang="scss" scoped></style>
