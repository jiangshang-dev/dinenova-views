<template>
  <div class="qr-container">
    <el-dialog
      class="common-dialog"
      title="下载二维码"
      width="800px"
      :model-value="showDialog"
      @close="close"
      destroy-on-close
    >
      <el-form class="qr-form" label-width="60px">
        <el-form-item label="尺寸">
          <el-select v-model="size" class="size-select" :teleported="false" @change="confirm">
            <el-option label="边长约4厘米，400*400像素" :value="400"></el-option>
            <el-option label="边长约5厘米，500*500像素" :value="500"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-checkbox v-model="isName" @change="confirm">是否显示桌台名称</el-checkbox>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="type" @change="confirm">
            <el-radio label="minAppQrCode">小程序</el-radio>
            <el-radio label="h5QrCode">h5</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="bg-bar">
        <span class="bg-label">背景</span>
        <el-upload
          v-if="storeId"
          action="#"
          accept=".jpg,.jpeg,.png"
          :show-file-list="false"
          :http-request="uploadBackground"
        >
          <el-button size="small" type="primary" plain>上传背景</el-button>
        </el-upload>
        <span class="bg-tip">上传后本店所有桌码、店铺码都能选用。建议正方形，中间留空，jpg/png，不超过2MB，最多8张。</span>
      </div>
      <div class="bottom" v-loading="loadQr">
        <div class="demo-image" v-if="styles.length">
          <div class="block" v-for="item in styles" :key="item.key">
            <div class="preview">
              <el-image style="width: 100px; height: 100px" :src="item.url" fit="cover"></el-image>
            </div>
            <div class="style-name">{{ item.name || '系统背景' }}</div>
            <div class="style-actions">
              <i class="el-icon-download" title="下载" @click="down(item)"></i>
              <i v-if="item.custom" class="el-icon-delete" title="删除背景" @click="removeBackground(item)"></i>
            </div>
          </div>
        </div>
        <el-empty v-else description="还没有背景，请先上传"></el-empty>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { createQrCodeNew, uploadQrBackground, deleteQrBackground } from "@/api/common";
import axios from 'axios';
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'

defineOptions({ name: 'FuintQrCode' })

const props = defineProps({
showDialog: {
      type: [Boolean],
      default: () => false,
    },
    qr: {
      type: [Object],
      default: () => {},
    },
})

const emit = defineEmits([])

const state = reactive({
loadQr: false,
      size: 400,
      isName: false,
      type: 'minAppQrCode',
      styles: [],
      storeId: 0,
})
const { loadQr, size, isName, type, styles, storeId } = toRefs(state)

function confirm() {

      if (!props.showDialog || !props.qr || !props.qr.id) {
        return;
      }
      ;
      loadQr.value = true;
      createQrCodeNew({
        type: props.qr.type,
        id: props.qr.id,
        width: size.value,
        showName: isName.value ? 1 : 0,
        appType: props.type === 'minAppQrCode' ? 1 : 2
      }).then((response) => {
        const data = response.data || {};
        styles.value = data.styles || [];
        storeId.value = data.storeId || 0;
        loadQr.value = false;
      }).catch(() => {
        loadQr.value = false;
      });
    
}

function uploadBackground(option) {

      const file = option.file;
      if (!file) {
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        ElMessage.warning("图片不能超过2MB");
        return;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("type", props.qr.type);
      form.append("id", props.qr.id);
      loadQr.value = true;
      uploadQrBackground(form).then(() => {
        ElMessage.success("背景已保存，本店其他码也可以选用");
        confirm();
      }).catch(() => {
        loadQr.value = false;
      });
    
}

function removeBackground(item) {

      ElMessageBox.confirm("删除后本店将不能再选用这张背景，确定删除吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteQrBackground(item.backgroundId).then(() => {
          ElMessage.success("已删除");
          confirm();
        });
      }).catch(() => {});
    
}

function down(item) {

      if (!item || !item.url) {
        ElMessage.warning("请等待图片生成完成");
        return;
      }
      axios({
        url: item.url,
        method: "GET",
        responseType: "blob"
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", (item.name || "qrcode") + ".png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(() => {
        window.open(item.url);
      });
    
}

function close() {

      emit("closeDialog");
    
}

watch(() => props.showDialog, (value) => {
      if (value) {
        storeId.value = 0;
        styles.value = [];
        confirm();
      }
    })

watch(() => props.if, (value) => {
        storeId.value = 0;
        styles.value = [];
        confirm();
      })
</script>
<style scoped>
.qr-form {
  margin-bottom: 4px;
}
.size-select {
  width: 320px;
}
.bottom,
.bg-bar {
  display: flex;
  justify-content: left;
  align-items: center;
}
.bg-bar {
  margin: 8px 0 12px;
  flex-wrap: wrap;
}
.bg-label {
  width: 60px;
  text-align: right;
  padding-right: 12px;
  color: #606266;
}
.bg-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}
.block {
  background: rgb(232, 227, 227);
  padding: 10px;
  text-align: center;
  margin: 5px;
  border-radius: 8%;
  width: 120px;
}
.preview {
  height: 100px;
}
.style-name {
  margin-top: 6px;
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.style-actions i {
  font-size: 22px;
  cursor: pointer;
  margin: 6px 8px 0;
}
.demo-image {
  display: flex;
  flex-wrap: wrap;
}
</style>
