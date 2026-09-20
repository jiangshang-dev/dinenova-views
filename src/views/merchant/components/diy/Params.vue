<template>
  <div id="diy-editor" ref="diy-editor" class="diy-editor form-horizontal">
    <template v-if="form.curItem">
      <!--图片轮播-->
      <template v-if="form.curItem.type == 'userInfo'">
        <UserInfo
          :curItem="form.curItem"
          :selectedIndex="form.selectedIndex"
          @onEditorSelectImage="onEditorSelectImage"
          @onEditorResetColor="onEditorResetColor"
          @onEditorDeleleData="onEditorDeleleData"
          @onEditorAddData="onEditorAddData"
        ></UserInfo>
      </template>
      <!--图片轮播-->
      <template v-if="form.curItem.type == 'banner'">
        <Banner
          :curItem="form.curItem"
          :selectedIndex="form.selectedIndex"
          @onEditorSelectImage="onEditorSelectImage"
          @onEditorResetColor="onEditorResetColor"
          @onEditorDeleleData="onEditorDeleleData"
          @onEditorAddData="onEditorAddData"
        ></Banner>
      </template>
      <!--图片橱窗-->
      <template v-if="form.curItem.type == 'window'">
        <Window
          :curItem="form.curItem"
          :selectedIndex="form.selectedIndex"
          @onEditorSelectImage="onEditorSelectImage"
          @onEditorDeleleData="onEditorDeleleData"
          @onEditorResetColor="onEditorResetColor"
          @onEditorAddData="onEditorAddData"
        ></Window>
      </template>
      <!--广告导航-->
      <template v-if="form.curItem.type == 'adNav'">
        <adNav
          :curItem="form.curItem"
          :selectedIndex="form.selectedIndex"
          @onEditorSelectImage="onEditorSelectImage"
          @onEditorResetColor="onEditorResetColor"
          @onEditorAddData="onEditorAddData"
        ></adNav>
      </template>
      <!--导航组-->
      <template v-if="form.curItem.type == 'navBar'">
        <NavBar
          :curItem="form.curItem"
          :selectedIndex="form.selectedIndex"
          @onEditorSelectImage="onEditorSelectImage"
          @onEditorResetColor="onEditorResetColor"
          @onEditorAddData="onEditorAddData"
        ></NavBar>
      </template>
      <!--辅助空白-->
      <template v-if="form.curItem.type == 'blank'">
        <Blank
          :curItem="form.curItem"
          :selectedIndex="form.selectedIndex"
          @onEditorResetColor="onEditorResetColor"
        ></Blank>
      </template>
      <!--辅助线-->
      <template v-if="form.curItem.type == 'guide'">
        <Guide
          :curItem="form.curItem"
          :selectedIndex="form.selectedIndex"
          @onEditorResetColor="onEditorResetColor"
        ></Guide>
      </template>
    </template>
  </div>
</template>

<script setup>
import { deepClone } from "@/utils/base.js";
import UserInfo from "./params/UserInfo.vue";
import Banner from "./params/Banner.vue";
import Window from "./params/Window.vue";
import NavBar from "./params/NavBar.vue";
import Blank from "./params/Blank.vue";
import Guide from "./params/Guide.vue";
import adNav from "./params/adNav.vue";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import modal from '@/plugins/modal'

defineOptions({ name: 'Params' })

const props = defineProps(['form', 'defaultData', 'diyData'])

const state = reactive({
/*图片当前对象*/
      imgModel: null,
})
const { imgModel } = toRefs(state)

function onEditorAddData() {
  // 新增data数据
  var newDataItem = deepClone(
    props.defaultData[props.form.curItem.type].data[0]
  );
  props.form.curItem.data.push(newDataItem);
}

function onEditorResetColor(holder, attribute, color) {
  holder[attribute] = color;
}

function onEditorDeleleData(index, selectedIndex) {
  if (props.diyData.items[selectedIndex].data.length <= 1) {
    modal.msgWarning("至少保留一个！");
    return false;
  }
  props.diyData.items[selectedIndex].data.splice(index, 1);
}

function onEditorSelectImage(index, imgUrl, filePath) {
  imgModel.value = {
    index: index,
    imgUrl: imgUrl,
  };
  imgModel.value.index[imgModel.value.imgUrl] = filePath;
}
</script>

<style>
.param-img-item {
  position: relative;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #eeeeee;
  line-height: 20px;
  width: 100%;
}
.param-img-item .url-box,
.param-img-item p,
.param-img-item .icon {
  margin-bottom: 10px;
}
.param-img-item .d-s-c {
  gap: 8px;
}
.param-img-item .delete-box {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
  color: #cccccc;
}
.param-img-item .delete-box:hover {
  color: rgb(255, 51, 0);
}
.param-img-item .pic {
  margin-bottom: 10px;
}
.param-img-item .pic img {
  width: 200px;
  height: 100px;
  margin: 0 auto;
}
.param-img-item .icon img {
  width: 100px;
  height: 100px;
  margin: 0 auto;
}
.param-img-item .url-box {
  display: flex;
  justify-content: flex-start;
}
.param-img-item .url-box .key-name {
  display: block;
  line-height: 32px;
}
.param-img-item .url-box .el-input {
  flex: 1;
}
</style>
