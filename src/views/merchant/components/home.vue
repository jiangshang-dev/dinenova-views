<template>
  <div class="diy-container clearfix">
    <!--类别选择-->
    <div class="diy-menu">
      <Type v-if="!loading" :defaultData="defaultData"></Type>
    </div>

    <!--手机diy容器-->
    <div class="diy-phone">
      <Model
        v-if="!loading"
        ref="modelRef"
        :form="form"
        :diyData="diyData"
      ></Model>
    </div>

    <!--参数设置-->
    <div class="diy-info">
      <Params
        v-if="!loading"
        :form="form"
        :defaultData="defaultData"
        :diyData="diyData"
      ></Params>
    </div>

    <!--提交-->
    <div class="footer-wrap">
      <div class="footer-l">
        <el-button size="small" type="info" @click="didClickHistory"
          >查看上一次</el-button
        >
        <el-button size="small" type="info" @click="didClickStorage"
          >查看暂存</el-button
        >
        <div class="colorPicker">
          <el-button size="small" type="info">设置背景色</el-button>
          <el-color-picker v-model="form.bgcolor" @change="onBgcolorChange"></el-color-picker>
        </div>
      </div>
      <el-button size="small" type="primary" @click="submit" :loading="loading"
        >保存</el-button
      >
    </div>
    <el-dialog title="发布位置选择" v-model="dialogFormVisible">
      <el-form :model="form">
        <el-form-item>
          <el-select v-model="form.type" placeholder="请选择发布位置">
            <el-option label="暂存" value="0"></el-option>
            <el-option label="发布到当前店铺" value="1"></el-option>
            <el-option label="发布到多门店" value="2"></el-option>
            <el-option label="使用上次" value="3"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogSubmit">确 定</el-button>
      </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getWxHomeTemplate, saveHomeTemplate } from "@/api/template";
import { deepClone } from "@/utils/base.js";
import Type from "./diy/Type.vue";
import Model from "./diy/Model.vue";
import Params from "./diy/Params.vue";
import { ref, reactive, watch, onMounted, toRefs } from 'vue'
import modal from '@/plugins/modal'

defineOptions({ name: 'home' })

const props = defineProps(['storeId'])

const modelRef = ref(null)

const state = reactive({
  /*是否正在加载*/
  loading: true,
  /*默认数据*/
  defaultData: {},
  /*组件数据列表*/
  diyData: {
    items: [],
  },
  /*表单对象*/
  form: {
    type: "",
    /*当前选中*/
    curItem: {},
    /*当前选中的元素（下标）*/
    selectedIndex: -1,
    /* 首页背景色 */
    bgcolor: "#f2f2f2",
  },
  dialogFormVisible: false,
  store_Id: 0
})
const { loading, defaultData, diyData, form, dialogFormVisible, store_Id } = toRefs(state)

function getData(type, id) {
  store_Id.value = id;
  getWxHomeTemplate(id, type)
    .then((res) => {
      defaultData.value = res.data.defaultData || {};
      diyData.value = res.data.jsonData.pageDataJson || { items: [], bgcolor: "#f2f2f2" };
      if (!Array.isArray(diyData.value.items)) {
        diyData.value.items = [];
      }
      form.value.bgcolor = diyData.value.bgcolor || "#f2f2f2";
      diyData.value.bgcolor = form.value.bgcolor;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
}

function onAddItem(key) {
  // 复制默认diy组件数据
  let item = deepClone(defaultData.value[key]),
    cur_index = 0;
  if (form.value.selectedIndex < 0) {
    cur_index = 0;
    diyData.value.items.unshift(item);
  } else {
    cur_index = form.value.selectedIndex + 1;
    diyData.value.items.splice(cur_index, 0, item);
  }

  // 编辑当前选中的元素
  modelRef.value?.onEditer(cur_index);
}

function onBgcolorChange(val) {
  form.value.bgcolor = val || "#f2f2f2";
  diyData.value.bgcolor = form.value.bgcolor;
}

function didClickHistory() {
  getData("3", store_Id.value);
  form.value.selectedIndex = -1;
}

function didClickStorage() {
  getData("0", store_Id.value);
  form.value.selectedIndex = -1;
}

function submit() {
  form.value.type = "";
  dialogFormVisible.value = true;
}

function dialogSubmit() {
  if (!form.value.type) {
    modal.msgWarning("先选择需要发布的位置！");
    return;
  }

  dialogFormVisible.value = false;
  diyData.value.bgcolor = form.value.bgcolor;
  const data = JSON.stringify({
    type: form.value.type,
    storeId: store_Id.value,
    params: diyData.value,
  });
  saveHomeTemplate(data).then(() => {
    modal.msgSuccess("恭喜你，保存成功");
    getData(form.value.type + "", store_Id.value);
    form.value.selectedIndex = -1;
  });
}

onMounted(() => {
  if (props.storeId) {
    getData("1", props.storeId);
  }
})

watch(() => props.storeId, (id) => {
  if (id) {
    getData("1", id);
  }
})

defineExpose({ getData, onAddItem })
</script>

<style scoped lang="scss">
.diy-container {
  position: relative;
}

.footer-wrap {
  height: 60px;
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  border-top: 1px solid #eee;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 999;
  padding: 0 400px 0 280px;
  .footer-l {
    display: flex;
    align-items: center;
    margin-right: 30px;
    .colorPicker {
      display: flex;
      align-items: center;
      margin-left: 10px;
    }
  }
}
</style>
