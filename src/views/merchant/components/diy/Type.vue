<template>
  <div v-if="typeList != null">
    <div class="min-group">
      <div
        style="border: none"
        :name="key"
        v-for="(group, key) in typeList"
        :key="key"
      >
        <div class="hd">{{ typename(key) }}</div>
        <div class="bd">
          <div
            class="item"
            v-for="(item, index) in group.children"
            :key="index"
            @click="$parent.onAddItem(item.type)"
          >
            <p class="p-icon icon iconfont" :class="item.icon"></p>
            <p class="p-txt">{{ item.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'

defineOptions({ name: 'Type' })

const props = defineProps({
defaultData: Object,
})

const state = reactive({
/*类别列表*/
      typeList: null,
      activeName: 0,
})
const { typeList, activeName } = toRefs(state)

function init() {

      let tempList = {};
      for (let key in props.defaultData) {
        let item = props.defaultData[key];
        if (!tempList.hasOwnProperty(item.group)) {
          tempList[item.group] = {};
          tempList[item.group].children = [];
        }
        tempList[item.group].children.push(item);
      }
      typeList.value = tempList;
    
}

function typename(type) {

      let name = "";
      if (type == "media") {
        name = "媒体组件";
      } else if (type == "shop") {
        name = "商城组件";
      } else if (type == "tools") {
        name = "工具组件";
      } else if (type == "page") {
        name = "页面组件";
      }
      return name;
    
}
</script>

<style scoped>
.diy-container .min-group {
  padding-top: 10px;
}
.diy-container .min-group .hd {
  color: #333;
  padding: 0 20px;
}
.diy-container .min-group .hd::after {
  content: none;
}
.diy-container .min-group .bd {
  padding-top: 0;
}

.diy-container .min-group .p-icon {
  font-size: 22px;
  line-height: 1;
}
.diy-container .min-group .p-txt {
  font-size: 12px;
}
</style>
