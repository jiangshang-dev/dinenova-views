<template>
  <div>
    <div class="common-form">
      <span>{{ curItem.name }}</span>
    </div>
    <el-form
      size="small"
      :model="curItem"
      label-width="100px"
      v-if="curItem.style"
    >
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
          :min="-100"
          :max="100"
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
            @click.stop="
              onEditorResetColor(curItem.style, 'borderColor', '')
            "
            type="primary"
            link
            >重置</el-button
          >
        </div>
      </div>
      <!-- 登录状态 -->
      <div class="form-chink"></div>
      <div class="f16 gray3 form-subtitle">登录状态</div>
      <el-form-item label="登录状态：">
        <el-radio-group v-model="curItem.style.isLogin">
          <el-radio-button :value="1">开启</el-radio-button>
          <el-radio-button :value="0">关闭</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <!-- 登录前内容设置 -->
      <div class="form-chink"></div>
      <div class="f16 gray3 form-subtitle">登录前内容设置</div>
      <!-- 头像设置 -->
      <div class="form-item">
        <div class="form-label">头像大小设置：</div>
        <el-slider
          v-model="curItem.style.loginBeforeAvatarSize"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!-- 标题颜色 -->
      <div class="form-item">
        <div class="form-label">标题颜色：</div>
        <div class="flex-1 d-s-c" style="height: 36px">
          <el-color-picker
            size="default"
            v-model="curItem.style.loginBeforeTxtColor"
          ></el-color-picker>
          <el-input
            class="ml10"
            v-model="curItem.style.loginBeforeTxtColor"
            placeholder="透明"
          />
          <el-button
            style="margin-left: 10px"
            @click.stop="
              onEditorResetColor(
                curItem.style,
                'loginBeforeTxtColor',
                '#000000'
              )
            "
            type="primary"
            link
            >重置</el-button
          >
        </div>
      </div>
      <!-- 副标题颜色 -->
      <div class="form-item">
        <div class="form-label">副标题颜色：</div>
        <div class="flex-1 d-s-c" style="height: 36px">
          <el-color-picker
            size="default"
            v-model="curItem.style.loginBeforeSubTxtColor"
          ></el-color-picker>
          <el-input
            class="ml10"
            v-model="curItem.style.loginBeforeSubTxtColor"
            placeholder="透明"
          />
          <el-button
            style="margin-left: 10px"
            @click.stop="
              onEditorResetColor(
                curItem.style,
                'loginBeforeSubTxtColor',
                '#777777'
              )
            "
            type="primary"
            link
            >重置</el-button
          >
        </div>
      </div>
      <!-- 按钮背景颜色 -->
      <div class="form-item">
        <div class="form-label">按钮背景颜色：</div>
        <div class="flex-1 d-s-c" style="height: 36px">
          <el-color-picker
            size="default"
            v-model="curItem.style.loginBtnBg"
          ></el-color-picker>
          <el-input
            class="ml10"
            v-model="curItem.style.loginBtnBg"
            placeholder="透明"
          />
          <el-button
            style="margin-left: 10px"
            @click.stop="
              onEditorResetColor(curItem.style, 'loginBtnBg', '#113a28')
            "
            type="primary"
            link
            >重置</el-button
          >
        </div>
      </div>
      <!-- 按钮文字颜色 -->
      <div class="form-item">
        <div class="form-label">按钮文字颜色：</div>
        <div class="flex-1 d-s-c" style="height: 36px">
          <el-color-picker
            size="default"
            v-model="curItem.style.loginBtnTxtColor"
          ></el-color-picker>
          <el-input
            class="ml10"
            v-model="curItem.style.loginBtnTxtColor"
            placeholder="透明"
          />
          <el-button
            style="margin-left: 10px"
            @click.stop="
              onEditorResetColor(curItem.style, 'loginBtnTxtColor', '#ffffff')
            "
            type="primary"
            link
            >重置</el-button
          >
        </div>
      </div>
      <!-- 按钮弧度设置 -->
      <div class="form-item">
        <div class="form-label">按钮弧度：</div>
        <el-slider
          v-model="curItem.style.loginBtnRadius"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!-- 登录后内容设置 -->
      <div class="form-chink"></div>
      <div class="f16 gray3 form-subtitle">登录后内容设置</div>
      <!-- 头像设置 -->
      <div class="form-item">
        <div class="form-label">头像大小：</div>
        <el-slider
          v-model="curItem.style.loginAfterAvatarSize"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!-- 头像弧度设置 -->
      <div class="form-item">
        <div class="form-label">头像弧度：</div>
        <el-slider
          v-model="curItem.style.loginAvatarRadius"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!-- 二维码设置 -->
      <div class="form-item">
        <div class="form-label">二维码大小：</div>
        <el-slider
          v-model="curItem.style.loginQrSize"
          size="small"
          show-input
          :show-input-controls="false"
          input-size="small"
        ></el-slider>
      </div>
      <!-- 标题颜色 -->
      <div class="form-item">
        <div class="form-label">标题颜色：</div>
        <div class="flex-1 d-s-c" style="height: 36px">
          <el-color-picker
            size="default"
            v-model="curItem.style.loginAfterTxtColor"
          ></el-color-picker>
          <el-input
            class="ml10"
            v-model="curItem.style.loginAfterTxtColor"
            placeholder="透明"
          />
          <el-button
            style="margin-left: 10px"
            @click.stop="
              onEditorResetColor(curItem.style, 'loginAfterTxtColor', '#000000')
            "
            type="primary"
            link
            >重置</el-button
          >
        </div>
      </div>
      <!-- 副标题颜色 -->
      <div class="form-item">
        <div class="form-label">副标题颜色：</div>
        <div class="flex-1 d-s-c" style="height: 36px">
          <el-color-picker
            size="default"
            v-model="curItem.style.loginAfterSubTxtColor"
          ></el-color-picker>
          <el-input
            class="ml10"
            v-model="curItem.style.loginAfterSubTxtColor"
            placeholder="透明"
          />
          <el-button
            style="margin-left: 10px"
            @click.stop="
              onEditorResetColor(
                curItem.style,
                'loginAfterSubTxtColor',
                '#777777'
              )
            "
            type="primary"
            link
            >重置</el-button
          >
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { linkUrlList } from "@/utils/linkUrl";
import { getToken } from "@/utils/auth";
import draggable from "@/components/DraggableList.vue";
export default {
  components: {
    draggable,
  },
  data() {
    return {
      linkUrlList,
      // 上传地址
      uploadAction: import.meta.env.VUE_APP_SERVER_URL + "backendApi/file/upload",
      // 隐藏上传
      hideUpload: false,
      // 上传文件列表
      uploadFiles: [],
      uploadHeader: { "Access-Token": getToken() },
    };
  },
  props: ["curItem", "selectedIndex"],
  methods: {
    onEditorDeleleData(index, selectedIndex) {
      this.$emit("onEditorDeleleData", index, selectedIndex);
    },

    //添加子组件
    onEditorAddData() {
      this.$emit("onEditorAddData");
    },

    //重置颜色
    onEditorResetColor(holder, attribute, color) {
      this.$emit("onEditorResetColor", holder, attribute, color);
    },

    //修改图标
    handleUploadSuccess(file, element) {
      this.$emit("onEditorSelectImage", element, "imgUrl", file.data.filePath);
    },

    handleUploadBgImageSuccess(file) {
      this.$emit(
        "onEditorSelectImage",
        this.curItem.style,
        "loginBgImage",
        file.data.filePath
      );
    },
  },
};
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
