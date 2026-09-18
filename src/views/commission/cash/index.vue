<template>
  <div class="app-container">
    <el-form size="small" :inline="true" class="main-search" label-width="68px">
      <el-form-item label="所属店铺" prop="storeId">
        <el-select v-model="storeId" filterable clearable placeholder="请选择店铺" style="width: 100%;">
          <el-option
            v-for="item in storeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="员工姓名">
        <el-input
          v-model="realName"
          placeholder="请输入员工姓名"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="员工手机">
        <el-input
          v-model="mobile"
          placeholder="请输入员工手机号"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="status" placeholder="请选择状态" clearable style="width: 100%;">
          <el-option key="" label="全部" value="" />
          <el-option
            v-for="item in statusList"
            :key="item.key"
            :label="item.name"
            :value="item.key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开始日期">
        <el-date-picker
          v-model="startTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          placeholder="选择开始日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束日期">
        <el-date-picker
          v-model="endTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          placeholder="选择结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" size="default" style="width: 100%">
      <el-table-column prop="id" label="ID" width="100"></el-table-column>
      <el-table-column prop="mobile" label="手机号" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.staffInfo ? scope.row.staffInfo.mobile : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="staff" label="员工姓名" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.staffInfo ? scope.row.staffInfo.realName : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="staff" label="会员名称" :show-overflow-tooltip="true" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.userInfo ? scope.row.userInfo.userName : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="staff" label="所属门店" :show-overflow-tooltip="true" align="center">
        <template #default="scope">
          <span>{{ scope.row.storeInfo ? scope.row.storeInfo.name : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="佣金金额" width="100">
          <template #default="scope">
            ￥{{scope.row.amount}}
          </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80" prop="status">
        <template #default="scope">
          <span>{{ getName(statusList, scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" align="center" width="120"></el-table-column>
      <el-table-column label="操作" align="center" width="120" fixed='right'>
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-view"
            v-hasPermi="['commission:cash:index']"
            @click="handleDetail(scope.row)">详情
          </el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['commission:cash:index']"
            @click="handleUpdate(scope.row)">修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="page"
      v-model:limit="pageSize"
      @pagination="queryList" />
    <!--统计详情对话框 start-->
    <detail :show-dialog="detailDialog" ref="detail" />
    <!--统计详情对话框 end-->

    <!-- 添加或修改对话框 -->
    <el-dialog title="修改提现" v-model="openEdit" class="common-dialog" width="700px" append-to-body>
      <el-form ref="form" :model="updateForm" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="佣金金额" prop="amount">
              <el-input v-model="updateForm.amount" placeholder="请输入佣金金额" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息">
              <el-input v-model="updateForm.description" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="updateForm.status">
                <el-radio
                  v-for="item in statusList"
                  :key="item.key"
                  :label="item.key"
                  :value="item.value">{{ item.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitUpdate">确定</el-button>
        <el-button @click="cancelUpdate">取消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script>
  import { getCashList, updateCommissionCash } from "@/api/commission/cash";
  import { searchStore } from "@/api/store";
  import Detail from "./detail";
  export default {
    name: 'cashIndex',
    components: {
      Detail
    },
    data() {
      return {
        page: 1, // 初始页
        pageSize: 10, // 每页数
        total: 0,
        dataList: [],
        storeOptions: [],
        statusList: [],
        realName: '',
        mobile: '',
        status: '',
        storeId: '',
        startTime: null,
        endTime: null,
        openStaffScheme: false,
        detailDialog: false,
        openEdit: false,
        updateForm : { status : "A" },
      }
    },
    created: function () {
      this.queryList();
      this.getStoreList();
    },
    methods: {
      queryList() {
        let params = {
          page: this.page,
          limit: this.pageSize,
          realName: this.realName,
          mobile: this.mobile,
          storeId: this.storeId,
          status: this.status,
          startTime: this.startTime,
          endTime: this.endTime
        }
        getCashList(params).then(response => {
            this.dataList = response.data.dataList.content;
            this.total = response.data.dataList.totalElements;
            this.statusList = response.data.statusList;
        });
      },
      handleDetail(row) {
        this.detailDialog = true;
        this.$nextTick(() => {
          this.$refs.detail.init(row.uuid);
        })
      },
      // 修改按钮
      handleUpdate(row) {
        this.openEdit = true;
        this.updateForm = { id: row.id,
                            amount: row.amount,
                            status: row.status,
                            description: row.description };
      },
      // 确定修改
      submitUpdate() {
        updateCommissionCash(this.updateForm).then(response => {
          this.$modal.msgSuccess("提交成功");
          this.updateForm = { status: "A" };
          this.openEdit = false;
          this.queryList();
        }).catch(function() {
          this.$modal.msgError("提交失败");
        });
      },
      // 取消修改
      cancelUpdate() {
        this.updateForm = { status: "A" };
        this.openEdit = false;
      },
      handleQuery() {
        this.queryList();
      },
      // 重置按钮操作
      resetQuery() {
        this.page = 1;
        this.mobile = '';
        this.storeId = '';
        this.status = '';
        this.realName = '';
        this.startTime = '';
        this.endTime = '';
        this.handleQuery();
      },
      // 店铺列表
      getStoreList() {
        searchStore().then(response => {
            this.storeOptions = response.data.storeList;
        })
      }
    }
  }
</script>
<style scoped>
  .queryInput :deep(.el-input__inner) {
    border-radius: 0px;
    width: 200px;
  }
</style>
