<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="备注信息" prop="description">
        <el-input
          v-model="queryParams.description"
          placeholder="请输入备注信息"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable>
          <el-option key="A" label="待确认" value="A" />
          <el-option key="B" label="已完成" value="B" />
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
          @click="doSettle"
          v-hasPermi="['settlement:doSubmit']">发起结算</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="结算单号" prop="settlementNo" width="180" />
      <el-table-column label="订单总金额" align="center" prop="totalOrderAmount">
          <template #default="scope">
            <span>{{ scope.row.totalOrderAmount.toFixed(2) }}</span>
          </template>
      </el-table-column>
      <el-table-column label="结算金额" align="center" prop="amount">
         <template #default="scope">
             <span>{{ scope.row.amount.toFixed(2) }}</span>
         </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark">
        <template #default="scope">
          <span v-if="scope.row.description">{{ scope.row.description }}</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="结算时间" align="center" prop="createTime">
        <template #default="scope">
          <span v-if="scope.row.createTime">{{ parseTime(scope.row.createTime) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80" prop="status">
        <template #default="scope">
          <span>{{ getName(settleStatusList, scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center" prop="createTime">
        <template #default="scope">
          <span v-if="scope.row.operator">{{ scope.row.operator }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="130" fixed='right'>
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-view"
            v-hasPermi="['settlement:index']"
            @click="onDetail(scope.row)">详情</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            :disabled="scope.row.status == 'B'"
            v-hasPermi="['settlement:doConfirm']"
            @click="doConfirm(scope.row)">确认</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 结算对话框 -->
    <el-dialog title="发起结算" v-model="settleDialog" class="common-dialog" width="80%" append-to-body>
      <el-form ref="formRef" :model="form" label-width="120px" size="small" :inline="true">
        <el-row>
            <el-form-item label="结算商户" prop="merchantId">
              <el-select class="input" v-model="form.merchantId" style="width: 240px" placeholder="请选择商户">
                <el-option
                  v-for="item in merchantList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 'A'"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="结算店铺" prop="storeId">
              <el-select class="input" v-model="form.storeId" style="width: 240px" clearable placeholder="请选择店铺">
                <el-option
                  v-for="item in storeList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 'A'"></el-option>
              </el-select>
            </el-form-item>
        </el-row>
        <el-row>
            <el-form-item label="下单时间">
              <el-date-picker
                v-model="form.startTime"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="开始时间"></el-date-picker>
              <span class="sp"> ~ </span>
              <el-date-picker
                v-model="form.endTime"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="结束时间"></el-date-picker>
            </el-form-item>
            <el-form-item>
               <el-button type="danger" icon="el-icon-search" size="small" @click="queryOrder">查询订单</el-button>
            </el-form-item>
        </el-row>
      </el-form>

      <el-table ref="tables" v-loading="loading" :data="orderList">
        <el-table-column label="订单ID" prop="id" width="80" />
        <el-table-column label="订单号" prop="orderSn" width="190" />
        <el-table-column label="订单类型" align="center" prop="typeName">
          <template #default="scope">
            <span>{{ scope.row.typeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所属店铺" align="center" width="140" prop="storeInfo.name">
          <template #default="scope">
            <span v-if="scope.row.storeInfo">{{ scope.row.storeInfo.name }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" align="center" prop="amount">
          <template #default="scope">
            <span v-if="true">{{ scope.row.amount.toFixed(2) }}</span>
            <span v-else>0.00</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" align="center" width="130" prop="createTime">
          <template #default="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" align="center" width="80" prop="status">
          <template #default="scope">
            <span class="status-normal">{{ getName(statusList, scope.row.status) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="totalOrder>0"
        :total="totalOrder"
        v-model:page="form.page"
        v-model:limit="form.pageSize"
        @pagination="queryOrder" />
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="doSubmit">确定结算</el-button>
        <el-button @click="cancelSettle">取消</el-button>
      </div></template>
    </el-dialog>

    <!--结算详情对话框-->
    <el-dialog title="结算详情" v-model="detailDialog" class="common-dialog" width="80%" append-to-body>
      <el-table ref="tables" v-loading="loading" :data="settlementInfo ? settlementInfo.orderList.content : []">
        <el-table-column label="订单ID" prop="orderId" width="80">
          <template #default="scope">
            <span>{{ scope.row.orderInfo.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单号" prop="orderSn" width="190">
          <template #default="scope">
            <span>{{ scope.row.orderInfo.orderSn }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单类型" align="center" prop="typeName">
          <template #default="scope">
            <span>{{ scope.row.orderInfo.typeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所属店铺" align="center" width="140" prop="storeInfo.name">
          <template #default="scope">
            <span v-if="scope.row.orderInfo.storeInfo">{{ scope.row.orderInfo.storeInfo.name }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" align="center" prop="amount">
          <template #default="scope">
            <span v-if="true">{{ scope.row.orderInfo.amount.toFixed(2) }}</span>
            <span v-else>0.00</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" align="center" width="130" prop="createTime">
          <template #default="scope">
            <span>{{ scope.row.orderInfo.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" align="center" width="80" prop="status">
          <template #default="scope">
            <span class="status-normal">{{ getName(statusList, scope.row.orderInfo.status) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="settlementInfoTotalOrder>0"
        :total="settlementInfoTotalOrder"
        v-model:page="settlementInfoQuery.page"
        v-model:limit="settlementInfoQuery.pageSize"
        @pagination="getSettlementInfo" />
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="closeDetail">关闭</el-button>
      </div></template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { parseTime, getName } from '@/utils/fuint'
import modal from '@/plugins/modal'
import { getSettlementList, getSettlementInfo as fetchSettlementInfo, doSubmit as submitSettlement, doConfirm as confirmSettlement } from '@/api/settlement'
import { getOrderList } from '@/api/order'

defineOptions({ name: 'Settlement' })

const store = useStore()

const settleDialog = ref(false)
const detailDialog = ref(false)
const loading = ref(true)
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const list = ref([])
const merchantList = ref([])
const storeList = ref([])
const orderList = ref([])
const totalOrder = ref(0)
const statusList = ref([])
const settleStatusList = ref([])
const settlementInfo = ref(null)
const defaultSort = { prop: 'createTime', order: 'descending' }
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  status: ''
})
const settlementInfoQuery = reactive({
  settlementId: 0,
  page: 1,
  pageSize: 10
})
const settlementInfoTotalOrder = ref(0)
const form = reactive({
  page: 1,
  pageSize: 10,
  merchantId: store.getters.merchantId,
  storeId: '',
  startTime: '',
  endTime: ''
})
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function getList() {
  loading.value = true
  getSettlementList(queryParams).then(response => {
    list.value = response.data.paginationResponse.content
    total.value = response.data.paginationResponse.totalElements
    merchantList.value = response.data.merchantList
    storeList.value = response.data.storeList
    settleStatusList.value = response.data.statusList
    loading.value = false
  })
}

function handleQuery() {
  queryParams.page = 1
  getList()
}

function resetQuery() {
  queryForm.value?.resetFields()
  tables.value?.sort(defaultSort.prop, defaultSort.order)
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

function handleSortChange(column) {
  queryParams.orderByColumn = column.prop
  queryParams.isAsc = column.order
  getList()
}

function doSettle() {
  settleDialog.value = true
  form.merchantId = store.getters.merchantId
  form.storeId = ''
  form.startTime = ''
  form.endTime = ''
}

function cancelSettle() {
  settleDialog.value = false
}

function doSubmit() {
  loading.value = true
  formRef.value?.validate(valid => {
    if (valid) {
      submitSettlement(form).then(response => {
        settleDialog.value = false
        loading.value = false
        if (response.data) {
          modal.msgSuccess('提交结算成功！')
          getList()
          orderList.value = []
          totalOrder.value = 0
        }
      }).catch(function () {
        loading.value = false
      })
    }
  })
}

function doConfirm(row) {
  modal.confirm('确定已完成结算吗？').then(function () {
    const param = { settlementId: row.id }
    loading.value = true
    confirmSettlement(param).then(response => {
      loading.value = false
      if (response.code == '200') {
        modal.msgSuccess('完成结算')
        getList()
      } else {
        modal.msgError('确认失败')
      }
    }).catch(function () {
      loading.value = false
    })
  })
}

function onDetail(row) {
  settlementInfoQuery.settlementId = row.id
  getSettlementInfo()
  detailDialog.value = true
}

function getSettlementInfo() {
  loading.value = true
  fetchSettlementInfo(settlementInfoQuery).then(response => {
    settlementInfo.value = response.data.settlementInfo
    settlementInfoTotalOrder.value = settlementInfo.value.orderList.totalElements
    statusList.value = response.data.statusList
    loading.value = false
  }).catch(function () {
    loading.value = false
  })
}

function closeDetail() {
  settlementInfo.value = null
  detailDialog.value = false
}

function queryOrder() {
  loading.value = true
  form.payStatus = 'B'
  form.settleStatus = 'A'
  getOrderList(form).then(response => {
    orderList.value = response.data.paginationResponse.content
    totalOrder.value = response.data.paginationResponse.totalElements
    statusList.value = response.data.statusList
    loading.value = false
  }).catch(function () {
    loading.value = false
  })
}

getList()
</script>

