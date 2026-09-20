<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      name="file"
      :on-remove="handleRemove"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{hide: fileList.length >= limit}">
      <i class="el-icon-plus"></i>
    </el-upload>

    <!-- 上传提示 -->
    <div class="el-upload__tip" v-if="showTip">
      请上传
      <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
      <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      的文件
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="预览"
      width="800"
      append-to-body>
      <img
        :src="dialogImageUrl"
        style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import modal from '@/plugins/modal'

defineOptions({ name: 'ImageUpload' })

const props = defineProps({
    modelValue: [String, Object, Array],
    value: [String, Object, Array],
    // 图片数量限制
    limit: {
      type: Number,
      default: 5,
    },
    // 大小限制(MB)
    fileSize: {
       type: Number,
      default: 5,
    },
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ["png", "jpg", "jpeg"],
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    }
})

const emit = defineEmits(['update:modelValue', 'input'])

function emitValue(str) {
  emit('input', str)
  emit('update:modelValue', str)
}

const state = reactive({
number: 0,
      uploadList: [],
      dialogImageUrl: "",
      dialogVisible: false,
      hideUpload: false,
      baseUrl: import.meta.env.VUE_APP_BASE_API,
      uploadImgUrl: import.meta.env.VUE_APP_SERVER_URL + 'backendApi/file/upload', // 上传的图片服务器地址
      headers: {
        'Access-Token': getToken()
      },
      fileList: []
})
const { number, uploadList, dialogImageUrl, dialogVisible, hideUpload, baseUrl, uploadImgUrl, headers, fileList } = toRefs(state)

function handleRemove(file, fileList) {

      const findex = fileList.value.map(f => f.name).indexOf(file.name);
      if(findex > -1) {
        fileList.value.splice(findex, 1);
        emitValue(listToString(fileList.value));
      }
    
}

function handleUploadSuccess(res) {

      uploadList.value.push({ name: res.fileName, url: res.fileName });
      if (uploadList.value.length === number.value) {
        fileList.value = fileList.value.concat(uploadList.value);
        uploadList.value = [];
        number.value = 0;
        emitValue(listToString(fileList.value));
        modal.closeLoading();
      }
    
}

function handleBeforeUpload(file) {

      let isImg = false;
      if (props.fileType.length) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        isImg = props.fileType.some(type => {
          if (file.type.indexOf(type) > -1) return true;
          if (fileExtension && fileExtension.indexOf(type) > -1) return true;
          return false;
        });
      } else {
        isImg = file.type.indexOf("image") > -1;
      }

      if (!isImg) {
        modal.msgError(`文件格式不正确, 请上传${props.fileType.join("/")}图片格式文件!`);
        return false;
      }
      if (props.fileSize) {
        const isLt = file.size / 1024 / 1024 < props.fileSize;
        if (!isLt) {
          modal.msgError(`上传头像图片大小不能超过 ${props.fileSize} MB!`);
          return false;
        }
      }
      modal.loading("正在上传图片，请稍候...");
      number.value++;
    
}

function handleExceed() {

      modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
    
}

function handleUploadError() {

      modal.msgError("上传图片失败，请重试");
      modal.closeLoading();
    
}

function handlePictureCardPreview(file) {

      dialogImageUrl.value = file.url;
      dialogVisible.value = true;
    
}

function listToString(list, separator) {

      let strs = "";
      separator = separator || ",";
      for (let i in list) {
        strs += list[i].url.replace(baseUrl.value, "") + separator;
      }
      return strs != '' ? strs.substr(0, strs.length - 1) : '';
    
}

const showTip = computed(() => {
      return props.isShowTip && (props.fileType || props.fileSize);})

watch(
  () => (props.modelValue !== undefined ? props.modelValue : props.value),
  (val) => {
    if (val) {
      const list = Array.isArray(val) ? val : String(val).split(',')
      fileList.value = list.map((item) => {
        if (typeof item === 'string') {
          if (item.indexOf(baseUrl.value) === -1) {
            item = { name: baseUrl.value + item, url: baseUrl.value + item }
          } else {
            item = { name: item, url: item }
          }
        }
        return item
      })
    } else {
      fileList.value = []
    }
  },
  { deep: true, immediate: true }
)
</script>
<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
::v-deep.hide .el-upload--picture-card {
    display: none;
}
// 去掉动画效果
::v-deep .el-list-enter-active,
:deep(.el-list-leave-active) {
    transition: all 0s;
}

:deep(.el-list-enter, .el-list-leave-active) {
    opacity: 0;
    transform: translateY(0);
}
</style>

