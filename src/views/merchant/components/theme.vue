<template>
  <div class="page-theme-container">
    <el-form ref="form" :model="form" label-width="80px">
      <div class="btn-wrap">
          <el-button type="primary" @click="onSubmit">保存模板</el-button>
        </div>
      <el-form-item label="颜色选择">
        <div class="theme-color-row">
          <el-color-picker v-model="form.color"></el-color-picker>
          <div class="theme-color-preview" :style="{ background: form.color || '#DF5353' }"></div>
          <span class="theme-color-text">{{ form.color || '#DF5353' }}</span>
        </div>
      </el-form-item>
      <el-form-item label="模板选择" style="width: 1000px;">
        <el-radio-group class="styleSelect" v-model="form.templateValue">
          <el-card
            class="box-card"
            v-for="item in themeList"
            :body-style="{ padding: 0 }"
          >
            <el-radio :value="item.style" class="custom-el-radio">{{
              item.name
            }}</el-radio>
            <img
              :src="item.image"
              :style="{
                width: '100%',
                'vertical-align': 'middle',
                cursor: 'pointer',
              }"
              alt=""
              @click="select(item.style)"
            />
          </el-card>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { getWxOrderTemplate, saveTemplate } from "@/api/template";
import theme1 from "@/assets/img/theme1.png";
import theme2 from "@/assets/img/theme2.png";
import theme3 from "@/assets/img/theme3.png";
export default {
  props: ['storeId'],
  data() {
    return {
      themeList: [
        {
          style: "1",
          name: "模板一",
          image: theme1,
        },
        {
          style: "2",
          name: "模板二",
          image: theme2,
        },
        {
          style: "3",
          name: "模板三",
          image: theme3,
        },
      ],
      form: {
        id: '', //店铺ID
        color: "#DF5353",
        templateValue: "1",
      },
      // 店铺Id
      store_Id: 0
    };
  },
  created() {
    this.getTemplate(this.storeId);
  },
  methods: {
    //获取现有模板信息
    getTemplate(id) {
      this.form.id = id;
      getWxOrderTemplate(id).then((res) => {
        if (res.code === 200 && res.data) {
          this.form.color = res.data.color || "#DF5353";
          this.form.templateValue = `${res.data.templateValue || "1"}`;
        }
      });
    },
    //切换模板
    select(style) {
      this.form.templateValue = style;
    },
    //保存模板
    onSubmit() {
      saveTemplate(JSON.stringify(this.form)).then((response) => {
        this.$modal.msgSuccess("保存成功");
      });
    },
  },
};
</script>
<style scoped lang="scss">
.page-theme-container {
  position: relative;
  overflow-y: scroll;
  height: calc(100vh - 98px);
}

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

.btn-wrap {
  margin-left: 10px;
  margin-bottom: 20px;
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
