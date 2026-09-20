<template>
  <div>
    <div class="common-form">
      <span>{{ curItem.name }}</span>
    </div>
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
          @click.stop="onEditorResetColor(curItem.style, 'bgcolor', '#ffffff')"
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
          @click.stop="
            onEditorResetColor(curItem.style, 'borderColor', '')
          "
          type="primary"
          link
          >重置</el-button
        >
      </div>
    </div>
    <div class="form-chink"></div>
    <div class="f16 gray3 form-subtitle">导航模式</div>
    <!--每行数量-->
    <div class="pl56" style="padding: 20px 0 20px 50px">
      <span>每行数量：</span>
      <el-radio-group v-model="curItem.style.rowsNum">
        <el-radio :value="1">4个</el-radio>
        <el-radio :value="2">5个</el-radio>
      </el-radio-group>
    </div>
    <div class="form-chink"></div>
    <el-form size="small" :model="curItem" label-width="100px">
      <div class="f16 gray3 form-subtitle">
        图片设置
        <span class="gray9 f12">图片上传建议宽度88*88px</span>
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
              class="d-b-c param-img-item"
            >
              <div class="d-c d-c-c mr10" style="width: 20px"></div>
              <div class="right">
                <i
                  class="el-icon-DeleteFilled el-icon-error"
                  @click="onEditorDeleleData(index)"
                ></i>
                <div class="d-s-c mb16 ww100">
                  <div class="url-box d-s-c">
                    <span class="key-name">图标</span>
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
                        <div class="icon-text">点击替换</div>
                        <img :src="$addPrefix(element.imgUrl)" alt="" />
                      </div>
                    </el-upload>
                  </div>
                </div>
                <div class="url-box mb16 flex-1 d-s-c ww100">
                  <span class="key-name">标题</span>
                  <el-input
                    maxlength="6"
                    show-word-limit
                    clearable
                    v-model="element.title"
                  ></el-input>
                </div>
                <div class="url-box mb16 flex-1 d-s-c ww100">
                  <span class="key-name">标题颜色</span>
                  <div class="flex-1 d-s-c" style="height: 36px">
                    <el-color-picker
                      size="default"
                      v-model="element.titlecolor"
                    ></el-color-picker>
                    <el-input
                      class="ml10"
                      v-model="element.titlecolor"
                      placeholder="透明"
                    />
                    <el-button
                      style="margin-left: 10px"
                      @click.stop="
                        onEditorResetColor(element, 'titlecolor', '#666666')
                      "
                      type="primary"
                      link
                    >
                      重置
                    </el-button>
                  </div>
                </div>
                <div class="d-s-c ww100">
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
              </div>
            </div>
          </template>
        </draggable>
      </template>
      <div
        class="d-c-c pb16"
        v-if="
          (curItem.data.length < 8 && curItem.style.rowsNum == 1) ||
          (curItem.data.length < 10 && curItem.style.rowsNum == 2)
        "
      >
        <el-button plain type="primary" @click="onEditorAddData"
          >+添加{{ curItem.data.length }}/{{
            curItem.style.rowsNum == 1 ? "8" : "10"
          }}</el-button
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
import modal from '@/plugins/modal'

defineOptions({ name: 'NavBar' })

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

function onEditorDeleleData(index) {

      let self = this;
      if (self.curItem.data.length <= 1) {
        modal.msgWarning("至少保留一个！");
        return false;
      }
      self.curItem.data.splice(index, 1);
    
}

function onEditorSelectImage(index, imgUrl) {

      emit("onEditorSelectImage", index, imgUrl);
    
}

function onEditorResetColor(holder, attribute, color) {

      emit("onEditorResetColor", holder, attribute, color);
    
}

function onEditorAddData() {

      emit("onEditorAddData");
    
}

function handleUploadSuccess(file, element) {

      emit("onEditorSelectImage", element, "imgUrl", file.data.filePath);
    
}
</script>

<style scoped>
.diy-tabbar {
  margin: 0;
  padding: 0;
  background: none;
}

.model-container {
  width: 375px;
  height: calc(100vh - 150px);
  margin: 0 auto;
  background-color: #fff;
}

.mr30 {
  margin-right: 30px;
}

.model-container img {
  width: 100%;
}

.model-container .img-box {
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.1);
}

.param-container {
  width: 400px;
  max-height: calc(100vh - 98px);
  overflow-y: auto;
  background: #fff;
}

.param-container .el-form-item {
  --font-size: 14px !important;
}

.form-title {
  padding: 0 22px;
  height: 62px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  color: #666;
  font-weight: bold;
}

.form-subtitle {
  padding-top: 18px;
  padding-bottom: 18px;
  padding-left: 20px;
}

.icon {
  position: relative;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon img {
  width: 88px;
  height: 88px;
}

.icon .icon-text {
  width: 100%;
  height: 28px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  line-height: 28px;
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

.nav_img {
  width: 30px !important;
  height: 30px;
}

.delete-box {
  z-index: 99;
  display: flex;
  justify-content: flex-end;
}

.param-img-item {
  position: relative;
  border: 1px solid #eee;
  margin-left: 10px;
  margin-top: 20px;
  padding: 0 22px 0 6px;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
}
.param-img-item .right {
  padding: 6px 0 26px 0;
  flex: 1;
}
.param-img-item .el-icon-DeleteFilled {
  font-size: 26px;
  position: absolute;
  right: -6px;
  top: -6px;
}

.form-item {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  padding: 10px;
}

.el-color-picker--small .el-color-picker__trigger {
  width: 36px;
  height: 36px;
}

.f12 {
  font-size: 12px;
}
.draggable-list {
  padding-bottom: 20px;
  padding-right: 18px;
}
</style>
