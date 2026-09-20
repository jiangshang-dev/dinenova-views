<!--树形下拉选择组件-->
<template>
  <el-select ref="selectTree" :value="value" v-model="valueName" :multiple="multiple" :clearable="clearable" @clear="clearHandle" @change="changeValue">
    <el-option :value="valueName" class="options">
      <el-tree id="tree-option" ref="selectTree" :accordion="accordion" :data="options" :props="props"
               :node-key="props.value" @node-click="handleNodeClick">
                <template #default="{ data }"><span>
                    <i :class="[data.color != null ? 'location_col' : '']"
                       :style="{ 'background-color': data.color }"></i>&nbsp;&nbsp;{{ data.name }}
                </span></template>
      </el-tree>
    </el-option>
  </el-select>
</template>
<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'

defineOptions({ name: 'TreeSelect' })

const props = defineProps({
// 配置项
    props: {
      type: Object,
      default: () => {
        return {
          value: 'id',
          children: 'children',
          label: 'name'
        }
      }
    },
    // 选项列表数据(树形结构的对象数组)
    options: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 初始值（单选）
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 初始值（多选）
    valueMultiple: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 可清空选项
    clearable: {
      type: Boolean,
      default: true
    },
    // 自动收起
    accordion: {
      type: Boolean,
      default: false
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    }
})

const emit = defineEmits([])

const state = reactive({
resultValue: [], // 传给父组件的数组对象值
      valueName: props.multiple ? [] : '' // 输入框显示值
})
const { resultValue, valueName } = toRefs(state)

function initHandle() {

      if (resultValue.value) {
        if (props.multiple) {
          // 多选
          resultValue.value.forEach(item => valueName.value.push(item.name));
        } else {
          // 单选
          valueName.value = resultValue.value.name;
        }
      }
      initScroll()
    
}

function initScroll() {

      nextTick(() => {
        let scrollWrap = document.querySelectorAll('.el-scrollbar .el-select-dropdown__wrap')[0]
        let scrollBar = document.querySelectorAll('.el-scrollbar .el-scrollbar__bar')
        scrollWrap.style.cssText = 'margin: 0px; max-height: none; overflow: hidden;'
        scrollBar.forEach(ele => ele.style.width = 0)
      })
    
}

function handleNodeClick(node) {

      // 设置点击叶子节点后被选中 可以更改为点击父节点也生效
      if (node.children == null || node.children == undefined || node.children.length < 1) {
        if (props.multiple) {
          // 多选（判重后添加）
          let num = 0;
          valueName.value.forEach(item => {
            item == node[props.props.label] ? num++ : num;
          })
          if (num == 0) {
            valueName.value.push(node[props.props.label]); // 输入框显示值
            resultValue.value.push(node);
          }
        } else {
          // 单选
          selectTreeRef.value.blur();
          valueName.value = node[props.props.label];
          resultValue.value = node;
        }
        emit('getValue', resultValue.value);
      }
    
}

function changeValue(val) {

      if (props.multiple) {
        // 多选（同时删掉传给父组件中多余的值，再传给父组件）
        resultValue.value.map((item, index) => {
          let i = val.indexOf(item.name)
          if (i == -1) {
            resultValue.value.splice(index, 1)
          }
        })
        emit('getValue', resultValue.value);
      } else {
        // 单选
        emit('getValue', val);
      }
    
}

function clearHandle() {

      valueName.value = props.multiple ? [] : ''
      resultValue.value = []
      clearSelected()
      emit('getValue', resultValue.value)
    
}

function clearSelected() {

      let allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach((element) => element.classList.remove('is-current'))
    
}
</script>
<style scoped>
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  max-height: 450px;
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
}
.el-select-dropdown__item.selected {
  font-weight: normal;
}
ul li>>>.el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
}
.el-tree-node__label {
  font-weight: normal;
}
.el-tree>>>.is-current .el-tree-node__label {
  color: #409EFF;
  font-weight: 700;
}
.el-tree>>>.is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}
.el-popper {
  z-index: 9999;
}
.location_col {
  width: 20px;
  height: 10px;
  display: inline-block;
}
</style>
