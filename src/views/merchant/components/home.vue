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
        ref="model"
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

<script>
import { getWxHomeTemplate, saveHomeTemplate } from "@/api/template";
import { deepClone } from "@/utils/base.js";
import Type from "./diy/Type.vue";
import Model from "./diy/Model.vue";
import Params from "./diy/Params.vue";
export default {
  props: ["storeId"],
  components: {
    /*组件类别*/
    Type,
    /*组件信息*/
    Model,
    /*参数信息*/
    Params,
  },
  data() {
    return {
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
    };
  },
  watch: {
    "form.bgcolor"(val) {
      if (this.diyData) {
        this.diyData.bgcolor = val || "#f2f2f2";
      }
    },
  },
  created() {
    this.getData("1",this.storeId);
  },
  methods: {
    /*获取列表*/
    getData(type, id) {
      let self = this;
      this.store_Id = id;
      getWxHomeTemplate(id, type)
        .then((res) => {
          self.defaultData = res.data.defaultData || {};
          self.diyData = res.data.jsonData.pageDataJson || { items: [], bgcolor: "#f2f2f2" };
          if (!Array.isArray(self.diyData.items)) {
            self.diyData.items = [];
          }
          self.form.bgcolor = self.diyData.bgcolor || "#f2f2f2";
          self.diyData.bgcolor = self.form.bgcolor;
          self.loading = false;
        })
        .catch((error) => {
          self.loading = false;
        });
    },

    /*新增Diy组件*/
    onAddItem: function (key) {
      // 复制默认diy组件数据
      let item = deepClone(this.defaultData[key]),
        cur_index = 0;
      if (this.form.selectedIndex < 0) {
        cur_index = 0;
        this.diyData.items.unshift(item);
      } else {
        cur_index = this.form.selectedIndex + 1;
        this.diyData.items.splice(cur_index, 0, item);
      }

      // 编辑当前选中的元素
      this.$refs.model.onEditer(cur_index);
    },

    onBgcolorChange(val) {
      this.form.bgcolor = val || "#f2f2f2";
      this.diyData.bgcolor = this.form.bgcolor;
    },

    /*查看上一次*/
    didClickHistory() {
      this.getData("3",this.store_Id);
      this.form.selectedIndex = -1;
    },

    /*查看缓存*/
    didClickStorage() {
      this.getData("0",this.store_Id);
      this.form.selectedIndex = -1;
    },

    /*上架*/
    submit() {
      this.form.type = "";
      this.dialogFormVisible = true;
    },

    dialogSubmit() {
      let self = this;
      if (!this.form.type) {
        this.$modal.msgWarning("先选择需要发布的位置！");
        return;
      }

      this.dialogFormVisible = false;
      this.diyData.bgcolor = this.form.bgcolor;
      const data = JSON.stringify({
        type: this.form.type,
        storeId: this.store_Id,
        params: this.diyData,
      });
      saveHomeTemplate(data).then((response) => {
        this.$modal.msgSuccess("恭喜你，保存成功");
        self.getData(this.form.type + "", this.store_Id);
        self.form.selectedIndex = -1;
      });
    },
  },
};
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
