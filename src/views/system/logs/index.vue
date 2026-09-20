<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" class="main-search" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="操作内容" prop="title">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入操作内容关键字"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作账号" prop="operName">
        <el-input
          v-model="queryParams.accountName"
          placeholder="请输入操作账号"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作IP" prop="ip">
        <el-input
          v-model="queryParams.ip"
          placeholder="请输入操作IP"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 300px"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:logs:delete']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="tables" v-loading="loading" :data="listData" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="操作内容" align="center" prop="module" width="200" :show-overflow-tooltip="true" />
      <el-table-column label="耗时" align="center" prop="timeConsuming" />
      <el-table-column label="IP" align="center" prop="clientIp" width="150" />
      <el-table-column label="操作账号" align="center" prop="acctName" />
      <el-table-column label="请求URL" align="center" prop="url" width="200" :show-overflow-tooltip="true" />
      <el-table-column label="客户端信息" align="center" prop="userAgent" width="250" :show-overflow-tooltip="true" />
      <el-table-column label="时间" align="center" prop="actionTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.actionTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" v-model="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }}</el-form-item>
            <el-form-item
              label="登录信息：">{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作状态：">
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间：">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import modal from '@/plugins/modal'
import { addDateRange, parseTime } from '@/utils/fuint'
import { list, delOperlog } from '@/api/system/logs'

defineOptions({ name: 'Logs' })

const loading = ref(true)
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const listData = ref([])
const open = ref(false)
const dateRange = ref([])
const defaultSort = reactive({ prop: 'createTime', order: 'descending' })
const form = ref({})
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  accountName: '',
  status: 'A'
})
const queryForm = ref(null)
const tables = ref(null)

function getList() {
  loading.value = true
  list(addDateRange(queryParams, dateRange.value)).then((response) => {
    listData.value = response.data.content
    total.value = response.data.totalElements
    loading.value = false
  })
}

function handleQuery() {
  queryParams.page = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  queryParams.accountName = ''
  queryParams.keyword = ''
  queryForm.value?.resetFields()
  tables.value?.sort(defaultSort.prop, defaultSort.order)
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.operId)
  multiple.value = !selection.length
}

function handleSortChange(column) {
  queryParams.orderByColumn = column.prop
  queryParams.isAsc = column.order
  getList()
}

function handleView(row) {
  open.value = true
  form.value = row
}

function handleDelete(row) {
  const operIds = row.operId || ids.value
  modal.confirm('是否确认删除日志编号为"' + operIds + '"的数据项？').then(function () {
    return delOperlog(operIds)
  }).then(() => {
    getList()
    modal.msgSuccess('删除成功')
  }).catch(() => {})
}

getList()
</script>

