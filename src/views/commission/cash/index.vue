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
<script setup>
import { nextTick, reactive, ref } from 'vue'

import modal from '@/plugins/modal'

import { parseTime } from '@/utils/fuint'

import { getName } from '@/utils/fuint'

import { getCashList, updateCommissionCash } from "@/api/commission/cash";
import { searchStore } from "@/api/store";
import Detail from "./detail";


defineOptions({ name: 'cashIndex' })


const page = ref(1)

const pageSize = ref(10)

const total = ref(0)

const dataList = reactive([])

const storeOptions = reactive([])

const statusList = reactive([])

const realName = ref('')

const mobile = ref('')

const status = ref('')

const storeId = ref('')

const startTime = ref(null)

const endTime = ref(null)

const openStaffScheme = ref(false)

const detailDialog = ref(false)

const openEdit = ref(false)

const updateForm = reactive({ status : "A" })

const formRef = ref(null)

const detailRef = ref(null)

function queryList() {
        let params = {
          page: page.value,
          limit: pageSize.value,
          realName: realName.value,
          mobile: mobile.value,
          storeId: storeId.value,
          status: status.value,
          startTime: startTime.value,
          endTime: endTime.value
        }
        getCashList(params).then(response => {
            dataList.length = 0; dataList.push(...(response.data.dataList.content || []));
            total.value = response.data.dataList.totalElements;
            statusList.length = 0; statusList.push(...(response.data.statusList || []));
        });
      }

function handleDetail(row) {
        detailDialog.value = true;
        nextTick(() => {
          detailRef.value.init(row.uuid);
        })
      }

function handleUpdate(row) {
        openEdit.value = true;
        Object.assign(updateForm, { id: row.id,)
                            amount: row.amount,
                            status: row.status,
                            description: row.description };
      }

function submitUpdate() {
        updateCommissionCash(updateForm).then(response => {
          modal.msgSuccess("提交成功");
          Object.assign(updateForm, { status: "A" });
          openEdit.value = false;
          queryList();
        }).catch(function() {
          modal.msgError("提交失败");
        });
      }

function cancelUpdate() {
        Object.assign(updateForm, { status: "A" });
        openEdit.value = false;
      }

function handleQuery() {
        queryList();
      }

function resetQuery() {
        page.value = 1;
        mobile.value = '';
        storeId.value = '';
        status.value = '';
        realName.value = '';
        startTime.value = '';
        endTime.value = '';
        handleQuery();
      }

function getStoreList() {
        searchStore().then(response => {
            storeOptions.length = 0; storeOptions.push(...(response.data.storeList || []));
        })
      }

queryList();
getStoreList();
</script>
<style scoped>
  .queryInput :deep(.el-input__inner) {
    border-radius: 0px;
    width: 200px;
  }
</style>
