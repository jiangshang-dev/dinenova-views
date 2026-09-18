<script>
import Theme from "./components/theme.vue";
import Home from "./components/home.vue";
import { searchStore } from "@/api/store";
export default {
  name: "FitmentPage",
  data() {
    return {
      active: 0,
      menuList: [
        {
          name: "首页装修",
        },
        {
          name: "点餐页装修",
        },
      ],
      // 店铺列表
      storeList: [],
      //选择的店铺ID
      form: {
        id: "", //店铺ID
      },
    };
  },
  components: {
    Theme,
    Home,
  },
  created() {
    this.getStoreList();
  },
  methods: {
    // 获取店铺列表
    getStoreList() {
      searchStore().then((response) => {
        if (response.code === 200 && response.data) {
          this.storeList = response.data.storeList;
          if (this.storeList.length > 0 && !this.form.id) {
            this.form.id = this.storeList[0].id;
          }
        }
      });
    },
    //切换菜单
    choseMenu(index) {
      if (index == this.active) {
        return;
      }
      this.active = index;
    },
    //选择店铺
    selectChange(id) {
      
      // this.$nextTick(()=>{
      //   console.log(this.$refs);
      // }) 
      this.$refs.homeRef.getData("1", id);
      this.$refs.themeRef.getTemplate(id);
    },
  },
};
</script>

<template>
  <div class="app-container">
    <div class="page-wrap" v-if="storeList.length > 0">
      <div class="page-box">
        <div class="page-aside">
          <div class="store-wrap">
            <div class="single" v-if="storeList.length == 1">
              {{ storeList[0].name }}
            </div>
            <div v-else>
              <el-form :model="form">
                <el-form-item prop="id">
                  <el-select
                    v-model="form.id"
                    placeholder="请选择所属店铺"
                    @change="selectChange"
                  >
                    <el-option
                      v-for="item in storeList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                      :disabled="item.status !== 'A'"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
          </div>
          <div class="links" v-for="(item, index) in menuList">
            <a
              :class="active === index ? 'active' : ''"
              @click="choseMenu(index)"
              >{{ item.name }}</a
            >
          </div>
        </div>
        <div class="page-content">
          <Home ref="homeRef" :storeId="form.id" v-show="active == 0"></Home>
          <Theme ref="themeRef" :storeId="form.id" v-show="active == 1"></Theme>
        </div>
      </div>
    </div>
    <div class="empty-box" v-else>
      <el-empty description="请先添加至少一个门店"></el-empty>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-box {
  display: flex;
}

.empty-box {
  width: 100%;
  text-align: center;
  margin-top: 100px;
}

.page-aside {
  width: 150px;
  padding-right: 20px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  .store-wrap {
    .single {
      color: #666;
      font-size: 14px;
      padding: 15px 0;
      text-align: center;
    }
  }
  .links {
    text-align: center;
    cursor: pointer;
    a {
      display: block;
      line-height: 1;
      padding: 15px 0;
      font-size: 14px;
      color: #666;
      position: relative;
      white-space: nowrap;
      &:hover {
        color: #3a8ee6;
      }

      &.active {
        color: #3a8ee6;
      }
    }
  }
}

.page-content {
  flex: 1;
  border-left: 1px solid #eee;
}
</style>
