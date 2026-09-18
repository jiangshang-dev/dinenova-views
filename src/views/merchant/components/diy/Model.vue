<template>
  <div class="diy-model-wrap">
    <div
      class="operate-pop"
      :class="{ disabled: form.selectedIndex == -1 }"
      v-if="diyData.items && diyData.items.length > 0"
    >
      <div class="iconbox d-c-c" @click="DeleteFunc">
        <i class="el-icon-delete" style="color: white; font-size: 20px"></i>
      </div>
      <div class="iconbox d-c-c" @click="DocumentCopyFunc">
        <i
          class="el-icon-document-copy"
          style="color: white; font-size: 20px"
        ></i>
      </div>
      <div
        class="iconbox d-c-c"
        :class="{ disabled: form.selectedIndex == 0 }"
        @click="ArrowUpBoldFunc"
      >
        <i class="el-icon-top" style="color: white; font-size: 20px"></i>
      </div>
      <div
        class="iconbox d-c-c"
        :class="{ disabled: form.selectedIndex == diyData.items.length - 1 }"
        @click="ArrowDownBoldFunc"
      >
        <i class="el-icon-bottom" style="color: white; font-size: 20px"></i>
      </div>
    </div>
    <div class="pr hh100 model-wrap" :style="{ background: form.bgcolor || '#f2f2f2' }">
      <div class="diy-phone-container">
        <draggable class="wrapper" v-model="diyData.items" :item-key="dragItemKey">
          <template #item="{ element, index }">
            <div
              class="diy-phone-item"
              :class="[
                { active: form.selectedIndex == index },
                { static: element.type == 'videoLive' },
              ]"
            >
              <!-- 图片轮播 -->
              <template v-if="element.type == 'banner'">
                <Banner
                  :item="element"
                  :index="index"
                  :selectedIndex="form.selectedIndex"
                  @onDeleleItem="onDeleleItem"
                  @onEditer="onEditer"
                ></Banner>
              </template>
              <!-- 用户信息 -->
              <template v-if="element.type == 'userInfo'">
                <UserInfo
                  :item="element"
                  :index="index"
                  :selectedIndex="form.selectedIndex"
                  @onDeleleItem="onDeleleItem"
                  @onEditer="onEditer"
                ></UserInfo>
              </template>
              <!-- 橱窗-->
              <template v-else-if="element.type == 'window'">
                <Window
                  :item="element"
                  :index="index"
                  :selectedIndex="form.selectedIndex"
                  @onDeleleItem="onDeleleItem"
                  @onEditer="onEditer"
                ></Window>
              </template>
              <!--导航组-->
              <template v-else-if="element.type == 'navBar'">
                <NavBar
                  :item="element"
                  :index="index"
                  :selectedIndex="form.selectedIndex"
                  @onDeleleItem="onDeleleItem"
                  @onEditer="onEditer"
                ></NavBar>
              </template>
              <template v-else-if="element.type == 'adNav'">
                <adNav
                  :item="element"
                  :index="index"
                  :selectedIndex="form.selectedIndex"
                  @onDeleleItem="onDeleleItem"
                  @onEditer="onEditer"
                ></adNav>
              </template>
              <!--辅助空白-->
              <template v-else-if="element.type == 'blank'">
                <Blank
                  :item="element"
                  :index="index"
                  :selectedIndex="form.selectedIndex"
                  @onDeleleItem="onDeleleItem"
                  @onEditer="onEditer"
                ></Blank>
              </template>
              <!--辅助线-->
              <template v-else-if="element.type == 'guide'">
                <Guide
                  :item="element"
                  :index="index"
                  :selectedIndex="form.selectedIndex"
                  @onDeleleItem="onDeleleItem"
                  @onEditer="onEditer"
                ></Guide>
              </template>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script>
import UserInfo from "./model/UserInfo.vue";
import Banner from "./model/Banner.vue";
import Window from "./model/Window.vue";
import NavBar from "./model/NavBar.vue";
import Blank from "./model/Blank.vue";
import adNav from "./model/adNav.vue";
import Guide from "./model/Guide.vue";
import draggable from "@/components/DraggableList.vue";
export default {
  components: {
    /*用户信息组件*/
    UserInfo,
    /*图片轮播组件*/
    Banner,
    /*图片橱窗*/
    Window,
    /*广告导航*/
    adNav,
    /*导航组*/
    NavBar,
    /*辅助空白*/
    Blank,
    /*辅助线*/
    Guide,
    /*拖动*/
    draggable,
  },
  data() {
    return {};
  },
  props: {
    form: Object,
    diyData: Object,
  },
  methods: {
    swapArray(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      return arr;
    },
    DeleteFunc() {
      let self = this;
      let n = self.form.selectedIndex;
      if (n < 0) {
        return;
      }
      self.diyData.items.splice(n, 1);
    },
    DocumentCopyFunc() {
      let self = this;
      let n = self.form.selectedIndex;
      if (n < 0) {
        return;
      }
      let item = self.diyData.items[n];
      self.diyData.items.splice(n, 0, item);
    },
    ArrowUpBoldFunc() {
      let self = this;
      let n = self.form.selectedIndex;
      if (n < 0) {
        return;
      }
      if (n != 0) {
        self.swapArray(self.diyData.items, n, n - 1);
        self.form.selectedIndex--;
      }
    },
    ArrowDownBoldFunc() {
      let self = this;
      let n = self.form.selectedIndex;
      if (n < 0) {
        return;
      }

      if (n + 1 != self.diyData.items.length) {
        self.swapArray(self.diyData.items, n, n + 1);
        self.form.selectedIndex++;
      }
    },
    /*删除diy元素*/
    onDeleleItem: function (index) {
      let self = this;
      this.$modal
        .confirm("确定要删除吗?")
        .then(() => {
          self.diyData.items.splice(index, 1);
          self.form.selectedIndex = -1;
        })
        .catch(() => {
          console.log("catch");
        });
    },

    /*编辑当前选中的Diy元素*/
    onEditer: function (index) {
      let self = this;
      // 记录当前选中元素的索引
      self.form.selectedIndex = index;
      // 当前选中的元素数据
      self.form.curItem =
        self.form.selectedIndex < 0
          ? self.diyData.page
          : self.diyData.items[self.form.selectedIndex];

      console.log(self.form.curItem);
    },
  },
};
</script>

<style lang="scss" scoped>
.diy-model-wrap {
  position: relative;
  height: 100%;

  .operate-pop {
    position: absolute;
    width: 42px;
    background: #409eff;
    left: 50%;
    margin-left: 206px;
    top: 0;
    border-radius: 4px;
    text-align: center;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
    z-index: 999;
    .iconbox {
      padding: 10px;
    }
    .el-icon {
      color: #fff;
      display: block;
      text-align: center;
      font-size: 20px;
      cursor: pointer;
    }
    .iconbox.disabled .el-icon {
      opacity: 0.4;
      cursor: no-drop;
    }
    &.disabled {
      .el-icon {
        opacity: 0.4;
        cursor: no-drop;
      }
    }
  }
}

.diy-phone-container {
  position: relative;
  height: 100%;
}

.diy-phone-container .wrapper {
  height: 100%;
}

.diy-phone-container .phone-top {
  padding: 0 20px;
  border-radius: 18px 18px 0 0;
}

.diy-phone-container .phone-top .status-bar {
  height: 20px;
  display: flex;
  justify-content: space-between;
}

.diy-phone-container .phone-top .svg-icon {
  width: 20px;
  height: 20px;
  color: #333333;
}

.diy-phone-container .phone-top .navigation {
  height: 44px;
  line-height: 44px;
  text-align: center;
  font-size: 18px;
}

.diy-phone-container .diy-phone-item {
  &.static {
    position: static;
  }
}

.diy-phone-container .diy-phone-item > div {
  position: relative;
  border: 2px solid #f1f1f2;
  border: none;
}

.diy-phone-container .diy-phone-item > div:hover,
.diy-phone-container .diy-phone-item.active > div {
  border: 2px dashed #3a8ee6;
}

.diy-phone-container :deep(img) {
  max-width: 100%;
}

.operate-pop {
  position: absolute;
  width: 42px;
  background: #409eff;
  right: 0;
  top: 0;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  z-index: 999;
  .iconbox {
    padding: 10px;
  }
  .el-icon {
    color: #fff;
    display: block;
    text-align: center;
    font-size: 20px;
    cursor: pointer;
  }
  .iconbox.disabled .el-icon {
    opacity: 0.4;
    cursor: no-drop;
  }
}
.operate-pop.disabled {
  .el-icon {
    opacity: 0.4;
    cursor: no-drop;
  }
}
.hh100 {
  height: 100%;
}
.diy-phone-container .diy-phone-item.pstatic {
  position: static;
}
</style>
