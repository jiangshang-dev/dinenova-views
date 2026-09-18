<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="桌码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入桌码"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px">
          <el-option key="A" label="启用" value="A" />
          <el-option key="N" label="禁用" value="N" />
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
          v-hasPermi="['table:index']">新增桌码</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id"  width="60" />
      <el-table-column label="桌子编码" align="center" prop="code" />
      <el-table-column label="人数限制" align="center" prop="maxPeople" />
      <el-table-column label="所属店铺" align="center" prop="store">
        <template #default="scope">
          <span v-if="scope.row.storeId && scope.row.storeId > 0">
              <span>{{ getName(storeList, scope.row.storeId) }}</span>
          </span>
          <span v-else>公共所有</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
      <template #default="scope">
        <el-switch
          v-model="scope.row.status"
          active-value="A"
          inactive-value="N"
          v-hasPermi="['table:index']"
          @change="handleStatusChange(scope.row)"></el-switch>
      </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-copy-document"
            v-hasPermi="['table:index']"
            @click="handleQrCode(scope.row)">下载二维码</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['table:index']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['table:index']"
            @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="桌子编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入桌子编码，如：A01" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属店铺" prop="storeId">
              <el-select v-model="form.storeId" placeholder="请选择所属店铺">
                <el-option
                  v-for="item in storeList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 'A'"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="人数上限" prop="maxPeople">
              <el-input-number v-model="form.maxPeople" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息">
              <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入备注信息内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" />
              <div class="form-tips">提示：数值越小，排行越靠前</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio key="A" label="A" value="A">启用</el-radio>
                <el-radio key="N" label="N" value="N">禁用</el-radio>
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

    <FuintQrCode :showDialog="openQrCode" :qr="qr" @closeDialog="closeDialog" />
  </div>
</template>

<script>
import FuintQrCode from '@/components/Fuint/QrCode';
import { getTableList, updateTableStatus, getTableInfo, saveTable } from "@/api/table";
export default {
  name: "TableIndex",
  components: {
    FuintQrCode
  },
  data() {
    return {
      // 二维码
      qr: null,
      // 二维码对话框
      openQrCode: false,
      // 遮罩层
      loading: true,
      // 标题
      title: "",
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 是否显示弹出层
      open: false,
      // 默认排序
      defaultSort: {prop: 'id', order: 'descending'},
      // 表单参数
      form: { id: '', code: '', storeId: '', sort: '', maxPeople: 0, status: "A" },
      // 店铺列表
      storeList: [],
      imagePath: "",
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        code: '',
        status: ''
      },
      // 表单校验
      rules: {
        code: [
          { required: true, message: "桌码不能为空", trigger: "blur" },
          { min: 2, max: 30, message: '桌码长度必须介于 2 和 30 之间', trigger: 'blur' }
        ],
        storeId: [
          { required: true, message: "所属店铺不能为空", trigger: "blur" },
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 查询列表
    getList() {
      this.loading = true;
      getTableList(this.queryParams).then( response => {
          this.list = response.data.paginationResponse.content;
          this.total = response.data.paginationResponse.totalElements;
          this.storeList = response.data.storeList;
          this.imagePath = response.data.imagePath;
          this.loading = false;
        }
      );
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
    // 状态修改
    handleStatusChange(row) {
      let text = row.status == "A" ? "启用" : "禁用";
      this.$modal.confirm('确认要' + text + '"' + row.code + '"桌码吗？').then(function() {
        return updateTableStatus(row.id, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "N" ? "A" : "N";
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.operId)
      this.multiple = !selection.length
    },
    // 排序触发事件
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    // 新增按钮操作
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "新增桌码";
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 提交按钮
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id) {
              saveTable(this.form).then(response => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              });
          } else {
              saveTable(this.form).then(response => {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              });
          }
        }
      });
    },
    // 二维码
    handleQrCode(row) {
      this.qr = { page: '/pages/category/index', type: "table", id: row.id };
      this.openQrCode = true;
    },
    // 关闭二维码
    closeDialog() {
      this.openQrCode = false;
    },
    // 修改按钮操作
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getTableInfo(id).then(response => {
        this.form = response.data.tableInfo;
        this.open = true;
        this.title = "编辑桌码";
      });
    },
    // 删除按钮操作
    handleDelete(row) {
      const code = row.code || this.id;
      this.$modal.confirm('是否确认删除"' + code + '"的数据项？').then(function() {
        return updateTableStatus(row.id, 'D');
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
