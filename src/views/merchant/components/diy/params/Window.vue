<template>
  <div>
    <div class="common-form">
      <span>{{ curItem.name }}</span>
    </div>
    <el-form size="small" :model="curItem" label-width="100px">
      <div class="f16 gray3 form-subtitle">样式设置</div>
      <!--上外边距-->
      <div class="form-item">
        <div class="form-label">上外边距：</div>
        <el-slider
          v-model="curItem.style.marginTop"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!--下外边距-->
      <div class="form-item">
        <div class="form-label">下外边距：</div>
        <el-slider
          v-model="curItem.style.marginBottom"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!--左右外边距-->
      <div class="form-item">
        <div class="form-label">左右外边距：</div>
        <el-slider
          v-model="curItem.style.marginLeft"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!--上下内边距-->
      <div class="form-item">
        <div class="form-label">上下内边距：</div>
        <el-slider
          v-model="curItem.style.paddingTop"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!--左右内边距-->
      <div class="form-item">
        <div class="form-label">左右内边距：</div>
        <el-slider
          v-model="curItem.style.paddingLeft"
          :max="200"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!--上圆角-->
      <div class="form-item">
        <div class="form-label">上圆角：</div>
        <el-slider
          v-model="curItem.style.topRadio"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!--下圆角-->
      <div class="form-item">
        <div class="form-label">下圆角：</div>
        <el-slider
          v-model="curItem.style.bottomRadio"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!-- 底部背景 -->
      <div class="form-item">
        <div class="form-label">底部背景：</div>
        <div class="flex-1 d-s-c" style="height: 36px">
          <el-color-picker
            size="default"
            v-model="curItem.style.bgcolor"
          ></el-color-picker>
          <el-input
            class="ml10"
            v-model="curItem.style.bgcolor"
            placeholder="透明"
          />
          <el-button
            style="margin-left: 10px"
            @click.stop="
              onEditorResetColor(curItem.style, 'bgcolor', '#ffffff')
            "
            type="primary"
            link
            >重置</el-button
          >
        </div>
      </div>
      <div class="form-item">
        <div class="form-label">边框颜色：</div>
        <div class="flex-1 d-s-c" style="height: 36px">
          <el-color-picker
            size="default"
            v-model="curItem.style.borderColor"
          ></el-color-picker>
          <el-input
            class="ml10"
            v-model="curItem.style.borderColor"
            placeholder="透明"
          />
          <el-button
            style="margin-left: 10px"
            @click.stop="onEditorResetColor(curItem.style, 'borderColor', '')"
            type="primary"
            link
            >重置</el-button
          >
        </div>
      </div>
      <div class="form-chink"></div>
      <div class="f16 gray3 form-subtitle">布局方式</div>
      <el-form-item label="">
        <el-radio-group v-model="curItem.style.layout">
          <el-radio-button :value="1">堆积一列</el-radio-button>
          <el-radio-button :value="2">堆积两列</el-radio-button>
          <el-radio-button :value="3">堆积三列</el-radio-button>
          <el-radio-button :value="4">堆积四列</el-radio-button>
          <el-radio-button :value="-1">橱窗样式</el-radio-button>
        </el-radio-group>
        <div v-if="curItem.style.layout == -1" class="red">
          橱窗样式最多显示三张图片，超出隐藏
        </div>
        <div class="gray9">请确保所有图片的尺寸/比例相同。</div>
      </el-form-item>
      <div class="f16 gray3 form-subtitle" style="margin-bottom: 10px">
        图片设置
        <span class="gray9 f12"
          >请确保所有图片的尺寸/比例相同；鼠标拖拽左侧圆点可调整导航顺序</span
        >
      </div>
      <template v-if="curItem.data && curItem.data.length > 0">
        <draggable
          v-model="curItem.data"
          group="people"
          :item-key="dragItemKey"
          class="draggable-list"
        >
          <template #item="{ element, index }">
            <div
              class="param-img-item navbar"
            >
              <i
                class="el-icon-Delete el-icon-error"
                @click="onEditorDeleleData(index, selectedIndex)"
              ></i>
              <div class="upload-wrap">
                <el-upload
                  :action="uploadAction"
                  list-type="picture-card"
                  :file-list="uploadFiles"
                  :auto-upload="true"
                  :show-file-list="false"
                  :headers="uploadHeader"
                  :on-success="
                    (response) => {
                      return handleUploadSuccess(response, element);
                    }
                  "
                >
                  <div class="icon">
                    <img
                      class="upload-img"
                      :src="$addPrefix(element.imgUrl)"
                      alt=""
                    />
                  </div>
                </el-upload>
              </div>
              <div
                class="url-box mb16 flex-1 d-s-c ww100"
                style="margin-top: 20px"
              >
                <span class="key-name">名称</span>
                <el-input
                  maxlength="6"
                  show-word-limit
                  disabled
                  :value="'图' + (index + 1)"
                ></el-input>
              </div>
              <div class="d-s-c ww100" style="margin-top: 20px">
                <div class="url-box flex-1 d-s-c">
                  <span class="key-name">跳转链接</span>
                  <el-select
                    clearable
                    v-model="element.linkUrl"
                    placeholder="请选择跳转链接"
                  >
                    <el-option
                      v-for="(item, index) in linkUrlList"
                      :key="'link_' + index"
                      :label="item.name"
                      :value="item.url"
                    ></el-option>
                  </el-select>
                </div>
              </div>
              <!--圆角-->
              <div class="d-s-c ww100" style="margin-top: 10px">
                <div class="url-box flex-1 d-s-c">
                  <span class="key-name">圆角大小</span>
                  <el-slider
                  v-model="element.radius"
                  size="small"
                  show-input
                  :show-input-controls="false"
                  input-size="small"
                ></el-slider>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </template>
      <div class="d-c-c pb16">
        <el-button plain type="primary" @click="onEditorAddData"
          >+添加一个</el-button
        >
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { getLinkUrlList as getLinkUrlListApi } from "@/api/link/homeLink";
import { getToken } from "@/utils/auth";
import draggable from "@/components/DraggableList.vue";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'

defineOptions({ name: 'Window' })

const props = defineProps(['curItem', 'selectedIndex'])

const emit = defineEmits([])

const state = reactive({
linkUrlList: [],
      // 上传地址
      uploadAction: import.meta.env.VUE_APP_SERVER_URL + "backendApi/file/upload",
      // 隐藏上传
      hideUpload: false,
      // 上传文件列表
      uploadFiles: [],
      uploadHeader: { "Access-Token": getToken() },
})
const { linkUrlList, uploadAction, hideUpload, uploadFiles, uploadHeader } = toRefs(state)

function getLinkUrlList() {

      getLinkUrlListApi().then(res=>{
        console.log('res,,,', res)
        if(res.code === 200){
          linkUrlList.value = res.data
        }
      })
    
}

function onEditorDeleleData(index, selectedIndex) {

      emit("onEditorDeleleData", index, selectedIndex);
    
}

function onEditorAddData() {

      emit("onEditorAddData");
    
}

function onEditorSelectImage(index, imgUrl) {

      emit("onEditorSelectImage", index, imgUrl);
    
}

function onEditorResetColor(holder, attribute, color) {

      emit("onEditorResetColor", holder, attribute, color);
    
}

function handleUploadSuccess(file, element) {

      emit("onEditorSelectImage", element, "imgUrl", file.data.filePath);
    
}
</script>

<style lang="scss" scoped>
.param-img-item.navbar {
  padding: 10px;
  min-height: 132px;
  height: auto;
}

.param-img-item.navbar .icon,
.diy-special-cover .icon {
  position: relative;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  display: flex;
}

.diy-special-cover {
  position: relative;
}

.param-img-item.navbar img,
.diy-special-cover img {
  width: 100%;
  height: auto;
}

.param-img-item .el-icon-Delete {
  font-size: 26px;
  position: absolute;
  right: -6px;
  top: -6px;
}

.upload-wrap {
  display: flex;
  justify-content: center;
}
</style>
