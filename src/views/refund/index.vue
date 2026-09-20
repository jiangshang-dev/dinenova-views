<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单号" prop="name">
        <el-input
          v-model="queryParams.orderSn"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号" prop="name">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="会员ID" prop="name">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入会员ID"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable>
          <el-option v-for="statusItem in statusList" :key="statusItem.key+''" :label="statusItem.name" :value="statusItem.key+''" />
        </el-select>
      </el-form-item>
      <el-form-item label="提交时间">
        <el-date-picker
          v-model="queryParams.startTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          style="width:200px"
          placeholder="开始时间"></el-date-picker>
        <span class="sp"> ~ </span>
        <el-date-picker
          v-model="queryParams.endTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          style="width:200px"
          placeholder="结束时间"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="售后ID" prop="id" width="60" />
      <el-table-column label="订单号" width="200" align="center" prop="orderSn">
        <template #default="scope">
          <span v-if="scope.row.orderInfo">{{ scope.row.orderInfo.orderSn }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="会员ID" align="center" prop="userId" />
      <el-table-column label="所属店铺" align="center" width="140" prop="storeInfo.name">
        <template #default="scope">
          <span v-if="scope.row.storeInfo">{{ scope.row.storeInfo.name }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="售后类型" align="center" prop="type">
         <template #default="scope">
             <span v-if="scope.row.type">{{ getName(refundTypeList, scope.row.type) }}</span>
         </template>
      </el-table-column>
      <el-table-column label="退款金额" align="center" prop="amount">
        <template #default="scope">
          <span v-if="true">{{ scope.row.amount.toFixed(2) }}</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" width="200" prop="remark">
        <template #default="scope">
          <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80" prop="status">
        <template #default="scope">
          <span v-if="scope.row.status == 'B'" class="status-active">{{ getName(statusList, scope.row.status) }}</span>
          <span v-else-if="scope.row.status == 'A'" class="status-normal">{{ getName(statusList, scope.row.status) }}</span>
          <span v-else class="status-disabled">{{ getName(statusList, scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" width="140" prop="createTime">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" width="140" prop="updateTime">
        <template #default="scope">
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="180" fixed='right'>
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-view"
            v-hasPermi="['order:detail']"
            @click="handleView(scope.row)">订单详情</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['refund:edit']"
            @click="handleUpdate(scope.row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 审核对话框 start-->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单号" prop="orderSn">
              <el-input v-model="orderInfo.orderSn" placeholder="订单号" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单总金额" prop="amount">
              <el-input :model-value="'￥' + orderInfo.amount" placeholder="订单总金额" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="orderInfo.userInfo">
          <el-col :span="24">
            <el-form-item label="会员名称" prop="userInfo">
              <el-input v-model="orderInfo.userInfo.name" placeholder="会员名称" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="申请时间" prop="createTime">
              <el-input v-model="orderInfo.createTime" placeholder="申请时间" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="申请备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" maxlength="255" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-select v-model="form.status" placeholder="状态">
                <el-option v-for="statusItem in statusList" :key="statusItem.key+''" :label="statusItem.name" :value="statusItem.key+''" />
              </el-select>
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

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getName, parseTime } from '@/utils/fuint'
import modal from '@/plugins/modal'
import { getRefundList, getRefundInfo, saveRefund } from '@/api/refund'

defineOptions({ name: 'RefundIndex' })

const router = useRouter()

const loading = ref(true)
const title = ref('')
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const list = ref([])
const statusList = ref([])
const refundTypeList = ref([])
const open = ref(false)
const defaultSort = { prop: 'createTime', order: 'descending' }
const form = reactive({ id: '', refundId: '', remark: '', status: 'A', createTime: '' })
const orderInfo = ref({})
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  orderSn: '',
  status: '',
  startTime: '',
  endTime: ''
})
const rules = {
  status: [{ required: true, message: '请选择状态', trigger: 'blur' }]
}
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function getList() {
  loading.value = true
  getRefundList(queryParams).then(response => {
    list.value = response.data.paginationResponse.content
    total.value = response.data.paginationResponse.totalElements
    statusList.value = response.data.statusList
    refundTypeList.value = response.data.refundTypeList
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

function reset() {
  Object.assign(form, { id: '', refundId: '', status: 'A', remark: '', createTime: '' })
  formRef.value?.resetFields()
}

function cancel() {
  open.value = false
  reset()
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      saveRefund(form).then(() => {
        modal.msgSuccess('修改成功')
        open.value = false
        getList()
      })
    }
  })
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getRefundInfo(id).then(response => {
    Object.assign(form, response.data.refundInfo)
    form.refundId = form.id
    form.createTime = parseTime(form.createTime)
    orderInfo.value = response.data.orderInfo
    open.value = true
    title.value = '审核售后订单'
  })
}

function handleView(row) {
  router.push('/order/detail?orderId=' + row.orderId)
}

getList()
</script>

