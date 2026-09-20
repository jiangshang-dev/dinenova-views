<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      @open="onOpen"
      @close="onClose">
      <el-row :gutter="0">
        <el-form
          ref="elForm"
          :model="formData"
          :rules="rules"
          size="small"
          label-width="100px">
          <el-col :span="24">
            <el-form-item
              label="选项名"
              prop="label">
              <el-input
                v-model="formData.label"
                placeholder="请输入选项名"
                clearable />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="选项值"
              prop="value">
              <el-input
                v-model="formData.value"
                placeholder="请输入选项值"
                clearable>
                <template #append><el-select
                  v-model="dataType"
                  :style="{width: '100px'}">
                  <el-option
                    v-for="(item, index) in dataTypeOptions"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled" />
                </el-select></template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <template #footer><div>
        <el-button
          type="primary"
          @click="handleConfirm">
          确定
        </el-button>
        <el-button @click="close">
          取消
        </el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { isNumberStr } from '@/utils/index'
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'

defineOptions({ name: 'TreeNodeDialog' })

const props = defineProps([])

const emit = defineEmits([])

const state = reactive({
id: 100,
      formData: {
        label: undefined,
        value: undefined
      },
      rules: {
        label: [
          {
            required: true,
            message: '请输入选项名',
            trigger: 'blur'
          }
        ],
        value: [
          {
            required: true,
            message: '请输入选项值',
            trigger: 'blur'
          }
        ]
      },
      dataType: 'string',
      dataTypeOptions: [
        {
          label: '字符串',
          value: 'string'
        },
        {
          label: '数字',
          value: 'number'
        }
      ]
})
const { id, formData, rules, dataType, dataTypeOptions } = toRefs(state)

function onOpen() {

      formData.value = {
        label: undefined,
        value: undefined
      }
    
}

function onClose() {

}

function close() {

      emit('update:visible', false)
    
}

function handleConfirm() {

      elFormRef.value.validate(valid => {
        if (!valid) return
        if (dataType.value === 'number') {
          formData.value.value = parseFloat(formData.value.value)
        }
        formData.value.id = id.value++
        emit('commit', formData.value)
        close()
      })
    
}

watch(number, string)

watch(() => props.function, (val) => {
      dataType.value = isNumberStr(val) ? 'number' : 'string'
    })
</script>
