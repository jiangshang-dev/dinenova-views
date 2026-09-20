<template>
  <el-dialog
    class="common-dialog"
    title="点餐页模板"
    width="800px"
    :model-value="showDialog"
    destroy-on-close
    @close="close">
    <el-form ref="formRef" :model="form" label-width="80px">
      <el-form-item label="颜色选择">
        <div class="theme-color-row">
          <el-color-picker v-model="form.color"></el-color-picker>
          <div class="theme-color-preview" :style="{ background: form.color || '#DF5353' }"></div>
          <span class="theme-color-text">{{ form.color || '#DF5353' }}</span>
        </div>
      </el-form-item>
      <el-form-item label="模板选择">
        <el-radio-group class="styleSelect" v-model="form.templateValue">
          <el-card
            class="box-card"
            v-for="item in themeList"
            :key="item.style"
            :body-style="{ padding: 0 }">
            <el-radio :value="item.style" class="custom-el-radio">{{ item.name }}</el-radio>
            <img
              :src="item.image"
              :style="{ width: '100%', 'vertical-align': 'middle', cursor: 'pointer' }"
              alt=""
              @click="select(item.style)">
          </el-card>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存模板</el-button>
        <el-button @click="close">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { saveTemplate } from "@/api/template";
import theme1 from "@/assets/img/theme1.png";
import theme2 from "@/assets/img/theme2.png";
import theme3 from "@/assets/img/theme3.png";
import { ref, reactive, computed, watch, toRefs } from 'vue'
import modal from '@/plugins/modal'

defineOptions({ name: 'OrderTemplate' })

const props = defineProps({
showDialog: {
      type: Boolean,
      default: false
    },
    qr: {
      type: Object,
      default: () => ({})
    }
})

const emit = defineEmits(['closeDialog', 'getList'])

const state = reactive({
  themeList: [
    { style: "1", name: "模板一", image: theme1 },
    { style: "2", name: "模板二", image: theme2 },
    { style: "3", name: "模板三", image: theme3 }
  ],
  form: {
    color: "#DF5353",
    templateValue: "1"
  }
})
const { themeList, form } = toRefs(state)

function onSubmit() {

      const row = (props.qr && props.qr.row) || {};
      saveTemplate({
        id: row.id,
        storeId: row.storeId,
        merchantId: row.merchantId,
        color: form.value.color,
        templateValue: form.value.templateValue
      }).then(() => {
        modal.msgSuccess("保存成功");
        emit("getList");
        close();
      });
    
}

function select(style) {

      form.value.templateValue = style;
    
}

function confirm() {

      const row = (props.qr && props.qr.row) || {};
      form.value.color = row.color || "#DF5353";
      form.value.templateValue = `${row.templateValue || "1"}`;
    
}

function close() {

      emit("closeDialog");
    
}

watch(() => props.showDialog, (value) => {
  if (value) {
    confirm();
  }
})
</script>

<style scoped>
.styleSelect {
  display: flex;
  width: 100%;
  justify-content: space-around;
}
.box-card {
  width: 30%;
}
.custom-el-radio {
  width: 100%;
  text-align: center;
  padding: 15px 0 10px;
}
.theme-color-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.theme-color-preview {
  width: 120px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #eee;
}
.theme-color-text {
  color: #666;
  font-size: 13px;
}
</style>
