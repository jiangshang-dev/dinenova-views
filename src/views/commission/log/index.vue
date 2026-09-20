<template>
  <div class="app-container">
    <!--查询参数-->
    <el-form size="small" :inline="true" class="main-search" label-width="68px">
      <el-form-item label="分佣对象" prop="target">
        <el-select v-model="target" placeholder="请选择方案对象" clearable style="width: 100%;">
          <el-option key="" label="全部" value="" />
          <el-option key="staff" label="员工提成" value="staff" />
          <el-option key="member" label="会员分销" value="member" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属店铺" prop="storeId">
        <el-select v-model="storeId" filterable clearable placeholder="请选择店铺" style="width: 100%;">
          <el-option
            v-for="item in storeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"></el-option>
        </el-select>
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
      <el-form-item label="起止时间">
        <el-date-picker
          v-model="startTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          style="width:200px"
          placeholder="开始时间"></el-date-picker>
        <span class="sp"> ~ </span>
        <el-date-picker
          v-model="endTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          style="width:200px"
          placeholder="结束时间"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
        <el-button icon="el-icon-plus" type="primary" plain size="small" @click="doSettle">发起结算</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" size="default" style="width: 100%">
      <el-table-column prop="orderId" label="订单号" width="190">
        <template #default="scope">
          <span @click="handleView(scope.row.orderInfo.id)" style="color: #00afff;cursor: pointer;">{{ scope.row.orderInfo.orderSn }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="target" label="分佣对象" align="center" width="100">
        <template #default="scope">
          <span>{{ getName(targetList, scope.row.target) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="staff" label="员工姓名" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.staffInfo ? scope.row.staffInfo.realName : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="staff" label="会员名称" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.userInfo ? scope.row.userInfo.userName : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="typeName" label="订单类型"></el-table-column>
      <el-table-column prop="storeName" :show-overflow-tooltip="true" label="开单门店">
        <template #default="scope">
          <span>{{ scope.row.storeInfo.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderDate" label="开单时间" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderInfo.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="分佣金额">
        <template #default="scope">
          <span>{{ scope.row.amount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="comType" :show-overflow-tooltip="true" label="规则方案">
        <template #default="scope">
          <span>{{ scope.row.ruleInfo.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <span>{{ getName(statusList, scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed='right'>
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['commission:rule:index']">修改
          </el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            @click="handleCancel(scope.row)"
            :disabled="scope.row.status != 'A'"
            v-hasPermi="['commission:rule:index']">作废
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="page"
      v-model:limit="pageSize"
      @pagination="getCommissionLogList" />

    <!-- 添加或修改对话框 -->
    <el-dialog title="修改佣金" v-model="openEdit" class="common-dialog" width="700px" append-to-body>
      <el-form ref="form" :model="updateForm" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单ID" prop="orderId">
              <el-input v-model="updateForm.orderId" disabled maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="分佣金额" prop="amount">
              <el-input v-model="updateForm.amount" placeholder="请输入分佣金额" maxlength="200" />
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
                <el-radio key="A" label="A" value="A">正常</el-radio>
                <el-radio key="N" label="N" value="N">作废</el-radio>
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

    <!-- 结算对话框 -->
    <el-dialog title="结算确认" v-model="settleDialog" class="common-dialog" width="700px" append-to-body>
      <el-table ref="tables" v-loading="loading" :data="cashList">
        <el-table-column label="ID" prop="id" width="80" />
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
        <el-table-column label="所属店铺" align="center" prop="storeInfo.name">
          <template #default="scope">
            <span v-if="scope.row.storeInfo">{{ scope.row.storeInfo.name }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="结算佣金" align="center" width="100" prop="amount">
          <template #default="scope">
            <span v-if="true">{{ scope.row.amount.toFixed(2) }}</span>
            <span v-else>0.00</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="totalCash>0"
        :total="totalCash"
        v-model:page="page"
        v-model:limit="pageSize"
        @pagination="queryCashList" />
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitSettle">确定结算</el-button>
        <el-button @click="cancelSettle">取消结算</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'

import { useRouter, useRoute } from 'vue-router'

import modal from '@/plugins/modal'
import { ElMessageBox } from 'element-plus'

import { parseTime } from '@/utils/fuint'

import { getName } from '@/utils/fuint'

import { getCommissionLogList as fetchCommissionLogList, updateCommissionLog, deleteCommissionLog, doSettle as submitSettleRequest } from '@/api/commission/log'
import { getCashList, confirmCommissionCash, cancelCommissionCash } from "@/api/commission/cash";
import { searchStore } from "@/api/store";


defineOptions({ name: 'logIndex' })


const router = useRouter()
const route = useRoute()

const loading = ref(false)

const settleDialog = ref(false)

const cashList = reactive([])

const totalCash = ref(0)

const openEdit = ref(false)

const updateForm = reactive({})

const statusList = reactive([])

const targetList = reactive([])

const page = ref(1)

const pageSize = ref(10)

const total = ref(0)

const list = reactive([])

const storeOptions = reactive([])

const realName = ref('')

const mobile = ref('')

const storeId = ref('')

const status = ref('')

const target = ref('')

const startTime = ref(null)

const endTime = ref(null)

const openStaffScheme = ref(false)

const detailDialog = ref(false)

const uuid = ref('')

const formRef = ref(null)

const tables = ref(null)

function loadCommissionLogList() {
        let params = {
          page: page.value,
          pageSize: pageSize.value,
          target: target.value,
          realName: realName.value,
          mobile: mobile.value,
          storeId: storeId.value,
          status: status.value,
          startTime: startTime.value,
          endTime: endTime.value
        }
        loading.value = true;
        fetchCommissionLogList(params).then(response => {
            list.splice(0, list.length, ...response.data.dataList.content);
            total.value = response.data.dataList.totalElements;
            statusList.splice(0, statusList.length, ...response.data.statusList);
            targetList.splice(0, targetList.length, ...response.data.targetList);
            loading.value = false;
          }
        );
      }

function handleQuery() {
        loadCommissionLogList();
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

function handleUpdate(row) {
        openEdit.value = true;
        Object.assign(updateForm, row);
      }

function handleCancel(row) {
        
        ElMessageBox.confirm('您确定要作废该笔佣金吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCommissionLog(row.id).then(response => {
            if (response.code == '200') {
                modal.msgSuccess("操作成功！");
                loadCommissionLogList();
            } else {
                modal.msgError("操作失败!");
            }
          });
        }).catch(() => {});
      }

function submitUpdate() {
        updateCommissionLog(updateForm).then(response => {
          modal.msgSuccess("提交成功");
          Object.keys(updateForm).forEach((key) => delete updateForm[key])
          openEdit.value = false;
          loadCommissionLogList();
        }).catch(function() {
          modal.msgError("提交失败");
        });
      }

function cancelUpdate() {
        Object.keys(updateForm).forEach((key) => delete updateForm[key])
        openEdit.value = false;
      }

function doSettle() {
        
        ElMessageBox.confirm('您确定要发起结算吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params = {
            target: target.value,
            realName: realName.value,
            mobile: mobile.value,
            storeId: storeId.value,
            startTime: startTime.value,
            endTime: endTime.value
          }
          submitSettleRequest(params).then(response => {
            if (response.code == '200') {
                modal.msgSuccess("操作成功！");
                uuid.value = response.data;
                queryCashList();
            } else {
                modal.msgError("操作失败!");
            }
          });
        }).catch(() => {});
      }

function submitSettle() {
        settleDialog.value = false;
        confirmCommissionCash({ uuid: uuid.value }).then(response => {
          loadCommissionLogList();
          settleDialog.value = false;
          modal.msgSuccess("确认成功！");
        }).catch(function() {
           modal.msgError("确认失败");
        });
      }

function cancelSettle() {
        settleDialog.value = false;
        cancelCommissionCash({ uuid: uuid.value }).then(response => {
          loadCommissionLogList();
          settleDialog.value = false;
          modal.msgSuccess("取消成功！");
        }).catch(function() {
          modal.msgError("取消结算");
        });
      }

function queryCashList() {
        loading.value = true;
        getCashList({ uuid: uuid.value } ).then(response => {
           cashList.length = 0; cashList.push(...(response.data.dataList.content || []));
           totalCash.value = response.data.dataList.totalElements;
           statusList.length = 0; statusList.push(...(response.data.statusList || []));
           settleDialog.value = true;
           loading.value = false;
        });
      }

function getStoreList() {
        searchStore().then(response => {
            storeOptions.length = 0; storeOptions.push(...(response.data.storeList || []));
          }
        )
      }

function handleView(orderId) {
        router.push('/order/detail?orderId=' + orderId)
      }

loadCommissionLogList();
getStoreList();
</script>
<style scoped>

  select {
    /*去除select边框*/
    border: 0;
    background: transparent;
    /*去除下拉框的三角下标*/
    appearance: none;
    -moz-appearance: none; /* Firefox */
    -webkit-appearance: none; /* Safari 和 Chrome */
    height: 32px;
    width: 100%;
    background-color: white;
    padding-left: 5px;
    border-radius: 5px;
  }

  input {
    width: 96%;
    height: 32px;
    font-size: 14px;
    color: #686868;
    border: 1px solid #d3d6dd;
    padding-left: 5px;
    border-radius: 5px;
  }

  .queryInput :deep(.el-input__inner) {
    border-radius: 0px;
    width: 200px;
  }
</style>
