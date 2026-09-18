<script>
import {getDelete, getInfo, getSettingsList, save, updateStatus} from "@/api/settings/settings";
import {getStoreList} from "@/api/store";
import {getTableInfo} from "@/api/table";

export default {

  data() {
    return {
      merchantOptions: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 是否显示弹出层
      open: false,
      // 标题
      title: "",
      form: {},
      queryParams: {
        page: 1,
        pageSize: 10,
        code: '',
        status: ''
      },
      // 表格数据
      list: [],
      // 表单校验
      rules: {
        color: [
          {required: true, message: "桌码不能为空", trigger: "blur"},
          {min: 3, max: 7, message: '颜色编码长度必须介于 3 和 7 之间', trigger: 'blur'}
        ],
        merchantId: [
          {required: true, message: "所属商户不能为空", trigger: "blur"},
        ]
      }
    }
  },
  created() {
    this.getList();
  },
  methods: {
    cancel() {
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id) {
            save(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            save(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    getList() {
      getSettingsList(this.queryParams).then(res => {
        console.log('res=====', res.data)
        console.log('res=====', res.data.paginationResponse.content)
        this.list = res.data.paginationResponse.content
        this.total = res.data.paginationResponse.totalElements;
        this.loading = false;
      })
      getStoreList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.merchantOptions = response.data.merchantList;
          this.loading = false;
        }
      );
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "新增";
    },
    handleUpdate(row) {
      this.open = true;
      this.title = "修改";

      const id = row.id || this.ids;
      getInfo(id).then(response => {
        console.log('ressss', response.data.mt_all_settingInfo)
        this.form = response.data.mt_all_settingInfo;
        this.open = true;
        this.title = "编辑桌码";
      });
    },
    handleDelete(row) {
      getDelete(row.id).then(result => {
        this.$message({
          message: '删除成功',
          type: 'success'
        });
        this.getList();
      })
    },
    // 表单重置
    reset() {
      this.form = {
        id: "",
        code: "",
        description: "",
        storeId: "",
        maxPeople: 0,
        sort: 0,
        status: "A",
      };
      this.resetForm("form");
    },
    // 状态修改
    handleStatusChange(row) {
      console.log('row:', row)
      let text = row.status == "A" ? "启用" : "禁用";
      this.$modal.confirm('确认要' + text + '"' + row.id + '"吗？').then(function () {
        return updateStatus(row.id, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === "S" ? "A" : "S";
      });
    },
    // 搜索按钮操作
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    // 重置按钮操作
    resetQuery() {
      this.resetForm("queryForm");
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order);
      this.handleQuery();
    },
  }
}
</script>

<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px"
        >
          <el-option key="A" label="启用" value="A"/>
          <el-option key="N" label="禁用" value="N"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['table:index']"
        >新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list">
      <el-table-column label="ID" prop="id" width="60"/>
      <el-table-column label="所属商户" align="center" prop="merchantName"/>
      <el-table-column label="小程序图片" align="center" prop="color"/>
      <el-table-column label="小程序页面" align="center" prop="page"/>
      <el-table-column label="排序" align="center" prop="sort"/>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="A"
            inactive-value="S"
            v-hasPermi="['table:index']"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['table:index']"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-if="false"
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['table:index']"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属商户" prop="merchantId">
              <el-select v-model="form.merchantId" placeholder="请选择所属商户">
                <el-option
                  v-for="item in merchantOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 'A'"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="小程序颜色" prop="color">
              <el-input v-model="form.color" placeholder="请输入颜色编码，如：#FFFFFF" maxlength="30"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="小程序页面">
              <el-input v-model="form.page" rows="3" placeholder="请输入小程序页面"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0"/>
              <div class="form-tips">提示：数值越小，排行越靠前</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio key="A" label="A" value="A">启用</el-radio>
                <el-radio key="S" label="S" value="S">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>

<style scoped>

</style>
